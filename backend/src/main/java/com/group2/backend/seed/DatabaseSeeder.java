package com.group2.backend.seed;

import com.group2.backend.model.Account;
import com.group2.backend.model.Artwork;
import com.group2.backend.repository.AccountRepository;
import com.group2.backend.repository.ArtworkLikeRepository;
import com.group2.backend.repository.ArtworkRepository;
import com.group2.backend.repository.PurchaseRepository;
import com.group2.backend.repository.TokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Slf4j
@Component
@Profile("dev")
@RequiredArgsConstructor
public class DatabaseSeeder implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final ArtworkRepository artworkRepository;
    private final PurchaseRepository purchaseRepository;
    private final ArtworkLikeRepository artworkLikeRepository;
    private final TokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;

    private static final int ACCOUNT_COUNT = 10;
    private static final int ARTWORK_COUNT = 50;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Cleaning database (dev seeder)...");
        clearDatabase();

        log.info("Seeding {} accounts and {} artworks (unsold)...", ACCOUNT_COUNT, ARTWORK_COUNT);
        List<Account> accounts = seedAccounts();
        seedArtworks(accounts);

        log.info("Database seed completed.");
    }

    private void clearDatabase() {
        artworkLikeRepository.deleteAllInBatch();
        purchaseRepository.deleteAllInBatch();
        tokenRepository.deleteAllInBatch();
        artworkRepository.deleteAllInBatch();
        accountRepository.deleteAllInBatch();
    }

    private List<Account> seedAccounts() {
        List<Account> accounts = new ArrayList<>();

        for (int i = 1; i <= ACCOUNT_COUNT; i++) {
            Account account = Account.builder()
                .username("artist" + i)
                .email("artist" + i + "@example.com")
                .password(passwordEncoder.encode("password" + i))
                .build();
            accounts.add(accountRepository.save(account));
        }

        return accounts;
    }

    private void seedArtworks(List<Account> accounts) {
        if (accounts.isEmpty()) {
            return;
        }

        Random random = new Random(42);
        List<Artwork> artworks = new ArrayList<>();

        for (int i = 1; i <= ARTWORK_COUNT; i++) {
            Account creator = accounts.get((i - 1) % accounts.size());
            BigDecimal price = BigDecimal.valueOf(10 + (random.nextInt(190)) + random.nextDouble()).setScale(2, RoundingMode.HALF_UP);

            Artwork artwork = Artwork.builder()
                .title("Artwork #" + i)
                .description("Sample description for artwork #" + i)
                .price(price)
                .imageUrl("https://picsum.photos/seed/art" + i + "/800/600")
                .creator(creator)
                .views(random.nextInt(250))
                .build();

            artworks.add(artwork);
        }

        artworkRepository.saveAll(artworks);
    }
}
