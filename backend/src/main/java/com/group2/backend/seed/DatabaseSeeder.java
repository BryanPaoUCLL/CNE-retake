package com.group2.backend.seed;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.group2.backend.model.Account;
import com.group2.backend.model.Artwork;
import com.group2.backend.model.ArtworkImage;
import com.group2.backend.model.ArtworkLike;
import com.group2.backend.model.Purchase;
import com.group2.backend.repository.AccountRepository;
import com.group2.backend.repository.ArtworkImageRepository;
import com.group2.backend.repository.ArtworkLikeRepository;
import com.group2.backend.repository.ArtworkRepository;
import com.group2.backend.repository.PurchaseRepository;
import com.group2.backend.repository.TokenRepository;
import com.group2.backend.service.ArtworkImageProcessingService;
import com.group2.backend.service.BlobStorageService;
import com.group2.backend.service.TagService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Random;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private static final long RNG_SEED = 42L;
    private static final Pattern YEAR_PATTERN = Pattern.compile("(1[0-9]{3}|20[0-9]{2})");

    private final AccountRepository accountRepository;
    private final ArtworkRepository artworkRepository;
    private final ArtworkImageRepository artworkImageRepository;
    private final PurchaseRepository purchaseRepository;
    private final ArtworkLikeRepository artworkLikeRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final BlobStorageService blobStorageService;
    private final ArtworkImageProcessingService artworkImageProcessingService;
    private final TagService tagService;
    private final JdbcTemplate jdbcTemplate;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        SeedConfig config = loadSeedConfig();

        log.info("Cleaning database and blob storage (dev seeder)...");
        clearDatabase();

        List<Account> allAccounts = seedAccounts(config.accounts);
        List<Account> creators = accountsByRole(allAccounts, config.accounts, "creator");
        List<Account> buyers = accountsByRole(allAccounts, config.accounts, "buyer");

        if (creators.isEmpty()) {
            log.warn("No creator accounts configured. Seeder stopped.");
            return;
        }

        List<LocalArtworkSeed> localArtworks = loadLocalArtworkSeeds(config.localArtworkRoot, config.artworksTarget);
        if (localArtworks.isEmpty()) {
            log.warn("No local artworks found in {}. Seeder stopped after account creation.", config.localArtworkRoot);
            return;
        }

        Random random = new Random(RNG_SEED);
        List<Artwork> artworks = seedArtworks(localArtworks, creators, config, random);
        seedPurchases(artworks, buyers, config, random);
        seedLikes(artworks, allAccounts, config, random);

        log.info(
            "Database seed completed: {} accounts, {} artworks, {} purchases, {} likes",
            allAccounts.size(),
            artworks.size(),
            purchaseRepository.count(),
            artworkLikeRepository.count()
        );
    }

    private SeedConfig loadSeedConfig() throws Exception {
        ClassPathResource resource = new ClassPathResource("seed/dev-seed.json");
        return objectMapper.readValue(resource.getInputStream(), SeedConfig.class);
    }

    private void clearDatabase() {
        deleteIfExists("artwork_tags");
        deleteIfExists("artwork_tag_refs");
        deleteIfExists("tag_aliases");
        deleteIfExists("tags");

        artworkLikeRepository.deleteAllInBatch();
        purchaseRepository.deleteAllInBatch();
        artworkImageRepository.deleteAllInBatch();
        tokenRepository.deleteAllInBatch();
        artworkRepository.deleteAllInBatch();
        accountRepository.deleteAllInBatch();
        blobStorageService.deleteAll();
    }

    private void deleteIfExists(String tableName) {
        try {
            jdbcTemplate.execute("DELETE FROM " + tableName);
        } catch (Exception ex) {
            log.debug("Skipping cleanup for table {} (not present yet): {}", tableName, ex.getMessage());
        }
    }

    private List<Account> seedAccounts(List<SeedAccountConfig> accountConfigs) {
        List<Account> result = new ArrayList<>();
        for (SeedAccountConfig cfg : accountConfigs) {
            Account saved = accountRepository.save(Account.builder()
                .username(cfg.username)
                .email(cfg.email)
                .password(passwordEncoder.encode(cfg.password == null || cfg.password.isBlank() ? "password123" : cfg.password))
                .build());
            result.add(saved);
        }
        return result;
    }

    private List<Account> accountsByRole(List<Account> allAccounts, List<SeedAccountConfig> configs, String role) {
        Set<String> usernames = configs.stream()
            .filter(cfg -> cfg.roles != null && cfg.roles.stream().anyMatch(r -> role.equalsIgnoreCase(r)))
            .map(cfg -> cfg.username)
            .collect(Collectors.toSet());

        return allAccounts.stream()
            .filter(acc -> usernames.contains(acc.getUsername()))
            .toList();
    }

    private List<LocalArtworkSeed> loadLocalArtworkSeeds(String rootDir, int maxItems) {
        Path rootPath = Paths.get(rootDir);
        if (!Files.exists(rootPath)) {
            log.warn("Local seed artwork directory not found: {}", rootPath.toAbsolutePath());
            return List.of();
        }

        List<LocalArtworkSeed> seeds = new ArrayList<>();

        try (Stream<Path> dirStream = Files.list(rootPath)) {
            List<Path> folders = dirStream
                .filter(Files::isDirectory)
                .sorted()
                .toList();

            for (Path folder : folders) {
                Path metadataPath = folder.resolve("metadata.json");
                if (!Files.exists(metadataPath)) {
                    continue;
                }

                try {
                    JsonNode meta = objectMapper.readTree(metadataPath.toFile());
                    int objectId = meta.path("objectID").asInt(0);
                    String title = meta.path("title").asText("").trim();
                    String artist = meta.path("artist").asText("").trim();
                    String objectDate = meta.path("objectDate").asText("").trim();

                    List<Path> imagePaths = new ArrayList<>();
                    JsonNode filesNode = meta.path("files");
                    if (filesNode.isArray()) {
                        for (JsonNode fileNode : filesNode) {
                            String fileName = fileNode.asText("").trim();
                            if (fileName.isBlank()) {
                                continue;
                            }
                            Path imagePath = folder.resolve(fileName);
                            if (Files.exists(imagePath)) {
                                imagePaths.add(imagePath);
                            }
                        }
                    }

                    if (title.isBlank() || imagePaths.isEmpty()) {
                        continue;
                    }

                    seeds.add(new LocalArtworkSeed(objectId, title, artist, objectDate, imagePaths));
                } catch (Exception ex) {
                    log.warn("Skipping invalid metadata in {}: {}", metadataPath, ex.getMessage());
                }
            }
        } catch (Exception ex) {
            log.error("Failed to read local artwork seeds from {}", rootPath.toAbsolutePath(), ex);
            return List.of();
        }

        Collections.shuffle(seeds, new Random(RNG_SEED));
        return seeds.stream().limit(Math.max(0, maxItems)).toList();
    }

    private List<Artwork> seedArtworks(List<LocalArtworkSeed> sources, List<Account> creators, SeedConfig config, Random random) {
        List<Artwork> savedArtworks = new ArrayList<>();
        Instant now = Instant.now();

        for (int i = 0; i < sources.size(); i++) {
            LocalArtworkSeed source = sources.get(i);
            Account creator = creators.get(random.nextInt(creators.size()));
            Integer year = extractYear(source.objectDate);

            Instant createdAt = now
                .minus(random.nextInt(730), ChronoUnit.DAYS)
                .minus(random.nextInt(24), ChronoUnit.HOURS);

            List<String> generatedTags = buildTags(source, creator, year, config.tagPools, random);

            Artwork artwork = artworkRepository.save(Artwork.builder()
                .title(source.title)
                .description(buildDescription(source, creator, year))
                .price(randomPrice(random))
                .year(year)
                .views(randomViewCount(config, random))
                .createdAt(createdAt)
                .creator(creator)
                .tags(tagService.resolveCanonicalTags(generatedTags))
                .build());

            int uploadedCount = uploadLocalImages(artwork, source, config.maxImagesPerArtwork);
            if (uploadedCount == 0) {
                artworkRepository.delete(artwork);
                continue;
            }

            savedArtworks.add(artwork);
            log.info("Seeded artwork {}/{}: {} ({} image(s), year={})", i + 1, sources.size(), artwork.getTitle(), uploadedCount, year);
        }

        return savedArtworks;
    }

    private int uploadLocalImages(Artwork artwork, LocalArtworkSeed source, int maxImagesPerArtwork) {
        int limit = Math.min(Math.max(1, maxImagesPerArtwork), source.imagePaths.size());
        int uploadedCount = 0;

        for (int i = 0; i < limit; i++) {
            Path imagePath = source.imagePaths.get(i);
            try {
                byte[] imageBytes = Files.readAllBytes(imagePath);
                String contentType = detectContentType(imagePath);

                ArtworkImageProcessingService.ImageMetadata meta = artworkImageProcessingService.extractMetadata(imageBytes);

                String blobName = "artworks/" + artwork.getId() + "/local-" + source.objectId + "-" + (i + 1) + extensionForMime(contentType);
                String thumbName = "artworks/" + artwork.getId() + "/thumbnails/local-" + source.objectId + "-" + (i + 1) + ".jpg";

                blobStorageService.upload(blobName, imageBytes, contentType);
                byte[] thumb = artworkImageProcessingService.createThumbnail(imageBytes, 300, contentType);
                blobStorageService.upload(thumbName, thumb, "image/jpeg");

                artworkImageRepository.save(ArtworkImage.builder()
                    .artwork(artwork)
                    .blobName(blobName)
                    .thumbnailBlobName(thumbName)
                    .originalFileName(imagePath.getFileName().toString())
                    .mimeType(contentType)
                    .fileSizeBytes(imageBytes.length)
                    .width(meta.getWidth())
                    .height(meta.getHeight())
                    .sortOrder(i)
                    .isMainImage(i == 0)
                    .createdAt(Instant.now())
                    .build());

                uploadedCount++;
            } catch (Exception ex) {
                log.warn("Skipping seed image for artwork {} from {}: {}", artwork.getId(), imagePath, ex.getMessage());
            }
        }

        return uploadedCount;
    }

    private void seedPurchases(List<Artwork> artworks, List<Account> buyers, SeedConfig config, Random random) {
        if (buyers.isEmpty()) {
            return;
        }

        int createdPurchases = 0;
        for (Artwork artwork : artworks) {
            if (random.nextDouble() > config.purchaseChance) {
                continue;
            }

            List<Account> candidates = buyers.stream()
                .filter(acc -> !acc.getId().equals(artwork.getCreator().getId()))
                .toList();
            if (candidates.isEmpty()) {
                continue;
            }

            List<Account> shuffled = new ArrayList<>(candidates);
            Collections.shuffle(shuffled, random);

            int maxPurchases = Math.min(config.maxPurchasesPerArtwork, shuffled.size());
            int purchaseCount = 1 + random.nextInt(Math.max(1, maxPurchases));

            for (int i = 0; i < purchaseCount; i++) {
                Account buyer = shuffled.get(i);
                Instant purchaseDate = artwork.getCreatedAt().plus(random.nextInt(240), ChronoUnit.DAYS);

                purchaseRepository.save(Purchase.builder()
                    .buyer(buyer)
                    .artwork(artwork)
                    .purchasePrice(artwork.getPrice())
                    .purchaseDate(purchaseDate)
                    .build());
                createdPurchases++;
            }
        }

        log.info("Seeded purchases: {}", createdPurchases);
    }

    private void seedLikes(List<Artwork> artworks, List<Account> accounts, SeedConfig config, Random random) {
        int createdLikes = 0;

        for (Artwork artwork : artworks) {
            List<Account> candidates = accounts.stream()
                .filter(acc -> !acc.getId().equals(artwork.getCreator().getId()))
                .toList();
            if (candidates.isEmpty()) {
                continue;
            }

            int maxLikes = Math.min(Math.max(config.maxLikesPerArtwork, 0), candidates.size());
            if (maxLikes == 0) {
                continue;
            }

            int minLikes = Math.min(Math.max(config.minLikesPerArtwork, 0), maxLikes);
            int likesForArtwork = minLikes + random.nextInt(maxLikes - minLikes + 1);

            List<Account> shuffled = new ArrayList<>(candidates);
            Collections.shuffle(shuffled, random);

            for (int i = 0; i < likesForArtwork; i++) {
                Account likedBy = shuffled.get(i);
                artworkLikeRepository.save(ArtworkLike.builder()
                    .account(likedBy)
                    .artwork(artwork)
                    .createdAt(artwork.getCreatedAt().plus(random.nextInt(120), ChronoUnit.DAYS))
                    .build());
                createdLikes++;
            }
        }

        log.info("Seeded likes: {}", createdLikes);
    }

    private String buildDescription(LocalArtworkSeed source, Account creator, Integer year) {
        String safeArtist = source.artist == null || source.artist.isBlank() ? "unknown artist" : source.artist;
        String safeYear = year == null ? "unknown year" : String.valueOf(year);
        return "Seeded from local MET export. Original artist: " + safeArtist + ", year: " + safeYear
            + ". Curated by " + creator.getUsername() + ".";
    }

    private List<String> buildTags(LocalArtworkSeed source, Account creator, Integer year, TagPools tagPools, Random random) {
        Set<String> tags = new HashSet<>();

        tags.add("painting");
        tags.add("museum");
        tags.add("seeded");
        tags.add("creator-" + creator.getUsername().toLowerCase(Locale.ROOT));

        if (source.artist != null && !source.artist.isBlank()) {
            tags.add("artist-" + normalizeToken(source.artist));
        }
        if (year != null) {
            tags.add("year-" + year);
            tags.add(String.valueOf(year));
        }

        addRandomTag(tags, tagPools.mediums, random);
        addRandomTag(tags, tagPools.styles, random);
        addRandomTag(tags, tagPools.subjects, random);
        addRandomTag(tags, tagPools.moods, random);

        return new ArrayList<>(tags);
    }

    private void addRandomTag(Set<String> target, List<String> pool, Random random) {
        if (pool == null || pool.isEmpty()) {
            return;
        }
        target.add(pool.get(random.nextInt(pool.size())).trim());
    }

    private String normalizeToken(String value) {
        return value.toLowerCase(Locale.ROOT)
            .replaceAll("[^a-z0-9\\s-]", " ")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }

    private Integer extractYear(String objectDate) {
        if (objectDate == null || objectDate.isBlank()) {
            return null;
        }
        Matcher matcher = YEAR_PATTERN.matcher(objectDate);
        if (matcher.find()) {
            try {
                int year = Integer.parseInt(matcher.group(1));
                if (year >= 1000 && year <= 2100) {
                    return year;
                }
            } catch (NumberFormatException ignored) {
                return null;
            }
        }
        return null;
    }

    private int randomViewCount(SeedConfig config, Random random) {
        int min = Math.max(0, config.minViews);
        int max = Math.max(min, config.maxViews);
        return min + random.nextInt(max - min + 1);
    }

    private BigDecimal randomPrice(Random random) {
        double value = 80 + (random.nextInt(950) + random.nextDouble());
        return BigDecimal.valueOf(value).setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private String detectContentType(Path imagePath) {
        String fileName = imagePath.getFileName().toString().toLowerCase(Locale.ROOT);
        if (fileName.endsWith(".png")) {
            return "image/png";
        }
        if (fileName.endsWith(".webp")) {
            return "image/webp";
        }
        return "image/jpeg";
    }

    private String extensionForMime(String mimeType) {
        if ("image/png".equalsIgnoreCase(mimeType)) {
            return ".png";
        }
        if ("image/webp".equalsIgnoreCase(mimeType)) {
            return ".webp";
        }
        return ".jpg";
    }

    private record LocalArtworkSeed(
        int objectId,
        String title,
        String artist,
        String objectDate,
        List<Path> imagePaths
    ) {}

    public static class SeedConfig {
        public String localArtworkRoot = "downloaded_artworks";
        public int artworksTarget = 40;
        public int maxImagesPerArtwork = 3;
        public int minViews = 40;
        public int maxViews = 2500;
        public double purchaseChance = 0.45;
        public int maxPurchasesPerArtwork = 2;
        public int minLikesPerArtwork = 1;
        public int maxLikesPerArtwork = 5;
        public List<SeedAccountConfig> accounts = new ArrayList<>();
        public TagPools tagPools = new TagPools();
    }

    public static class SeedAccountConfig {
        public String username;
        public String email;
        public String password;
        public List<String> roles = new ArrayList<>();
    }

    public static class TagPools {
        public List<String> mediums = new ArrayList<>();
        public List<String> styles = new ArrayList<>();
        public List<String> subjects = new ArrayList<>();
        public List<String> moods = new ArrayList<>();
    }
}
