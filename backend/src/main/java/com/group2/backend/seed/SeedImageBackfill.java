package com.group2.backend.seed;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.group2.backend.model.ArtworkImage;
import com.group2.backend.repository.ArtworkImageRepository;
import com.group2.backend.service.ArtworkImageProcessingService;
import com.group2.backend.service.BlobStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * One-time recovery tool for seed image records whose blobs are missing.
 *
 * This runner never deletes blobs and never writes to MongoDB. It only uploads
 * a bundled seed image when an existing, strictly matching seed blob name is
 * absent from the configured storage container.
 */
@Slf4j
@Component
@Profile("dev")
@ConditionalOnProperty(name = "app.seed-image-backfill.enabled", havingValue = "true")
@RequiredArgsConstructor
public class SeedImageBackfill implements CommandLineRunner {

    private static final Pattern SEED_BLOB_PATTERN = Pattern.compile(
        "^artworks/[0-9a-fA-F]{24}/seed-(aw-\\d+)-(\\d+)\\.(?:jpg|jpeg|png|webp)$"
    );

    private final ArtworkImageRepository artworkImageRepository;
    private final BlobStorageService blobStorageService;
    private final ArtworkImageProcessingService artworkImageProcessingService;
    private final ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        Map<String, ArtworkSeedImages> seedImagesById = loadSeedImages().stream()
            .collect(Collectors.toMap(ArtworkSeedImages::id, Function.identity()));

        int originalUploads = 0;
        int thumbnailUploads = 0;
        int alreadyComplete = 0;
        int ignored = 0;
        int failures = 0;

        log.info("Starting non-destructive seed image backfill");

        for (ArtworkImage image : artworkImageRepository.findAll()) {
            Matcher matcher = SEED_BLOB_PATTERN.matcher(image.getBlobName());
            if (!matcher.matches()) {
                ignored++;
                continue;
            }

            String seedId = matcher.group(1);
            int imageIndex = Integer.parseInt(matcher.group(2)) - 1;
            ArtworkSeedImages seed = seedImagesById.get(seedId);

            if (seed == null || seed.images() == null || imageIndex < 0 || imageIndex >= seed.images().size()) {
                log.warn("No bundled source mapping for seed blob {}; skipping", image.getBlobName());
                ignored++;
                continue;
            }

            String sourcePath = seed.images().get(imageIndex);
            ClassPathResource source = new ClassPathResource(sourcePath);
            if (!source.exists()) {
                log.warn("Bundled seed image {} is missing; skipping {}", sourcePath, image.getBlobName());
                failures++;
                continue;
            }

            try {
                boolean originalExists = blobStorageService.exists(image.getBlobName());
                boolean thumbnailExists = blobStorageService.exists(image.getThumbnailBlobName());

                if (originalExists && thumbnailExists) {
                    alreadyComplete++;
                    continue;
                }

                byte[] content = source.getInputStream().readAllBytes();
                String contentType = detectContentType(sourcePath);

                if (!originalExists) {
                    blobStorageService.upload(image.getBlobName(), content, contentType);
                    originalUploads++;
                }

                if (!thumbnailExists) {
                    byte[] thumbnail = artworkImageProcessingService.createThumbnail(content, 300, contentType);
                    blobStorageService.upload(image.getThumbnailBlobName(), thumbnail, thumbnailContentType(contentType));
                    thumbnailUploads++;
                }
            } catch (Exception ex) {
                failures++;
                log.warn("Failed to backfill {}: {}", image.getBlobName(), ex.getMessage());
            }
        }

        log.info(
            "Seed image backfill completed: {} originals uploaded, {} thumbnails uploaded, "
                + "{} already complete, {} non-seed records ignored, {} failures",
            originalUploads,
            thumbnailUploads,
            alreadyComplete,
            ignored,
            failures
        );
    }

    private List<ArtworkSeedImages> loadSeedImages() throws Exception {
        ClassPathResource resource = new ClassPathResource("seed/artworks.json");
        return objectMapper.readValue(resource.getInputStream(), new TypeReference<>() {});
    }

    private String detectContentType(String imagePath) {
        String lower = imagePath.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".webp")) return "image/webp";
        return "image/jpeg";
    }

    private String thumbnailContentType(String sourceContentType) {
        return "image/png".equalsIgnoreCase(sourceContentType) ? "image/png" : "image/jpeg";
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record ArtworkSeedImages(String id, List<String> images) {
    }
}
