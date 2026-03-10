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
import java.time.Instant;
import java.time.temporal.ChronoUnit;
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

    // ──────────────────────────────────────────────
    // Artist data
    // ──────────────────────────────────────────────

    private static final String[][] ARTISTS = {
        { "evasquez",      "Elena Vasquez",       "elena.vasquez@galerique.art" },
        { "mchen_studio",  "Marcus Chen",         "marcus.chen@galerique.art"  },
        { "aisha_creates", "Aisha Okonkwo",       "aisha.okonkwo@galerique.art" },
        { "lucafontaine",  "Luca Fontaine",       "luca.fontaine@galerique.art" },
        { "yukitanaka",    "Yuki Tanaka",         "yuki.tanaka@galerique.art"  },
        { "odubois",       "Olivier Dubois",      "olivier.dubois@galerique.art" },
        { "priya_art",     "Priya Sharma",        "priya.sharma@galerique.art" },
        { "finnlarsen",    "Finn Larsen",         "finn.larsen@galerique.art"  },
        { "sofialmeida",   "Sofia Almeida",       "sofia.almeida@galerique.art" },
        { "dvolkov",       "Dmitri Volkov",       "dmitri.volkov@galerique.art" },
        { "amaradiallo",   "Amara Diallo",        "amara.diallo@galerique.art" },
        { "hugoreyes",     "Hugo Reyes",          "hugo.reyes@galerique.art"   },
        { "ingridberg",    "Ingrid Bergström",    "ingrid.bergstrom@galerique.art" },
        { "kenjinakamura", "Kenji Nakamura",      "kenji.nakamura@galerique.art" },
        { "fatima_alh",    "Fatima Al-Hassan",    "fatima.alhassan@galerique.art" },
        { "tobias_nk",     "Tobias Müller",       "tobias.muller@galerique.art" },
        { "ceciliaromano", "Cecilia Romano",      "cecilia.romano@galerique.art" },
        { "ravikrishna",   "Ravi Krishnamurthy",  "ravi.krishna@galerique.art" },
        { "nadiapetrova",  "Nadia Petrova",       "nadia.petrova@galerique.art" },
        { "elias_osei",    "Elias Osei",          "elias.osei@galerique.art"   },
    };

    // ──────────────────────────────────────────────
    // Artwork data  { title, description, imageUrlSeed, priceStr }
    // ──────────────────────────────────────────────

    private static final String[][] ARTWORKS = {
        {
            "Chromatic Drift",
            "Layers of translucent colour bleed into one another like ink dropped in still water. The composition explores tension between control and surrender, inviting the viewer to follow each shifting gradient wherever it leads.",
            "101", "320.00"
        },
        {
            "Neon Requiem",
            "A nocturnal cityscape dissolves into phosphorescent streaks of magenta and electric blue. Inspired by nights spent wandering empty streets, this piece captures the melancholy beauty that only artificial light can conjure.",
            "102", "480.00"
        },
        {
            "The Weight of Silence",
            "A single figure stands at the edge of a vast, fog-covered valley. There is no horizon — only an endless grey that absorbs everything. What remains is the quiet, immovable presence of being entirely alone.",
            "103", "750.00"
        },
        {
            "Bloom Protocol",
            "Generative flora unfurls according to a hidden algorithm, each petal placed by probability rather than intention. The result feels alive — a digital garden that grows differently each time you look away.",
            "104", "210.00"
        },
        {
            "Recursion Garden",
            "Fractal forms nest inside each other until the eye can no longer tell where one shape ends and another begins. A meditation on self-similarity, infinity, and the strange comfort found in patterns that repeat forever.",
            "105", "390.00"
        },
        {
            "Portrait of a Stranger",
            "A face assembled from overlapping transparencies — each layer a different memory, a different version of the same person. Identity emerges not from any single expression but from the tension between all of them.",
            "106", "620.00"
        },
        {
            "Tide Mechanics",
            "The sea is here a machine: precise, cyclical, indifferent. Geometric waves advance in perfect formation while an unseen tide pulls everything back. Beauty and terror arrive at the same moment.",
            "107", "175.00"
        },
        {
            "Carbon Pastoral",
            "Rolling hills rendered in charcoal grays and deep umbers suggest a landscape that has survived something — fire, erosion, time. Life persists anyway, stubborn and small, in the foreground.",
            "108", "540.00"
        },
        {
            "Aurora Codex",
            "Northern lights translated into a grid of luminous glyphs. Science and mysticism fold into each other here — what looks like scripture might be spectrum analysis, and what looks like data might be prayer.",
            "109", "890.00"
        },
        {
            "Soft Architecture",
            "Rigid buildings give way to fabric and shadow. Walls curve, corners soften, and the boundary between interior and exterior becomes a question rather than a fact. What would it feel like if cities were made of cloth?",
            "110", "430.00"
        },
        {
            "Vanishing Meridian",
            "A long road narrows to nothing against a sky the colour of old film. The perspective is technically accurate yet somehow wrong — the vanishing point keeps moving as you look at it, refusing to stay still.",
            "111", "265.00"
        },
        {
            "Membrane",
            "Two worlds separated by a single translucent surface, each visible to the other but unreachable. This work came from a dream and was finished in a single session at 3 a.m. — some images arrive complete.",
            "112", "710.00"
        },
        {
            "Topography of Grief",
            "Terrain maps redrawn as emotional maps. The peaks are unbearable and the valleys are numb, and the thin lines between them trace a journey that has no fixed destination. Made in the month after a loss.",
            "113", "980.00"
        },
        {
            "Electric Folklore",
            "Myth reimagined in a high-voltage palette. Ancient symbols crackle with digital static; the old stories want to be told in new languages. This is one attempt to let them.",
            "114", "345.00"
        },
        {
            "Pale Infrastructure",
            "Bridges, conduits, and cables rendered in the white of bare bone. The systems that hold modern life together are usually invisible — here they are the only thing left, beautiful and slightly threatening.",
            "115", "590.00"
        },
        {
            "Inner Climate",
            "A weather map of the interior: pressure systems of anxiety, warm fronts of unexpected joy, the cold clarity that follows a long cry. Every person carries a private atmosphere with them wherever they go.",
            "116", "240.00"
        },
        {
            "Archipelago Mind",
            "Islands of thought suspended in a dark, still sea. Each island is complete in itself yet separated from the others by distances that look small on the map but feel enormous from the water.",
            "117", "660.00"
        },
        {
            "Synthetic Savanna",
            "Wildlife observed and redrawn as geometric approximations. The animals are recognisable but wrong — too angular, too still. Nature as filtered through a machine that has only ever seen photos of nature.",
            "118", "415.00"
        },
        {
            "Vertical Garden",
            "A tower of living green rises from a grey urban slab. The plants are winning. This is not dystopia — it might actually be the opposite. Let things grow where they can.",
            "119", "185.00"
        },
        {
            "Ghost Frequency",
            "A radio signal from somewhere very far away, visualised as a standing wave caught between two peaks. The source is unknown. The message, if there is one, has not yet been decoded.",
            "120", "520.00"
        },
        {
            "Lunar Cartography",
            "Every crater, ridge, and mare rendered with the care of a love letter. The moon charted not for navigation but for the pleasure of knowing something well — the way you might memorise a face.",
            "121", "780.00"
        },
        {
            "Signal Loss",
            "A transmission interrupted. The image breaks apart into glitch artefacts, revealing the fragile infrastructure beneath every seamless-looking thing. Failure can be more honest than function.",
            "122", "310.00"
        },
        {
            "Anthropocene Veil",
            "Industrial haze rendered as a soft, almost tender curtain drawn across an otherwise pristine vista. The relationship between beauty and damage has always been complicated.",
            "123", "640.00"
        },
        {
            "Spore Logic",
            "Mushrooms mapped according to their underground logic: networks, signals, slow communication between root systems. Perhaps the forest is thinking. Perhaps it always has been.",
            "124", "295.00"
        },
        {
            "Quiet Acceleration",
            "Speed captured in stillness. A frozen moment of something moving very fast — car, thought, feeling — where the blur is more real than any sharp edge could ever be.",
            "125", "460.00"
        },
        {
            "Deep Lacquer",
            "Inspired by ancient lacquerware traditions, this work builds up layers of near-black until depth becomes physical. You want to reach in. You can't. That is the point.",
            "126", "830.00"
        },
        {
            "Parallel Liturgy",
            "Two ceremonies happening simultaneously in the same space: one sacred, one profane, neither aware of the other. The composition lets you see both at once, which neither participant can do.",
            "127", "570.00"
        },
        {
            "Rust and Reverie",
            "Industrial decay treated as something worth pausing over. Because it is. The patina of oxidation is time made visible — and time, at any magnification, is beautiful.",
            "128", "220.00"
        },
        {
            "Liminal Shore",
            "The edge where land becomes sea becomes sky becomes something with no name. Thresholds interest me more than destinations. This piece lives in the pause between one state and the next.",
            "129", "740.00"
        },
        {
            "Overgrowth Archives",
            "Text and image reclaimed by vegetation. Vines push through words; moss softens hard information. What the archive was trying to preserve is now less interesting than what is growing over it.",
            "130", "380.00"
        },
        {
            "Thermal Portrait",
            "A human silhouette rendered in heat-camera false colour — oranges and yellows at the core, cooling to blues and greens at the edges. Warmth as data. Presence as temperature.",
            "131", "695.00"
        },
        {
            "Stone Frequency",
            "Ancient standing stones reinterpreted as antennas, broadcasting something at the edge of human perception. What were they built to transmit? What are we still receiving without knowing?",
            "132", "510.00"
        },
        {
            "Cobalt Reverie",
            "A dream painted entirely in blues — from the almost-white of thin sky to the near-black of deep ocean. Within this constrained palette, an entire emotional register becomes available.",
            "133", "350.00"
        },
        {
            "Fracture Hymn",
            "Broken glass as music: each shard a note, each crack a rest. The composition is violent and precise simultaneously. Something had to break for this to exist.",
            "134", "920.00"
        },
        {
            "Sand Algorithm",
            "Wind-sculpted dunes redrawn by a generative system that does not know what wind is. The output looks identical. This says something about intelligence, or pattern, or both.",
            "135", "275.00"
        },
        {
            "Hollow Geometry",
            "Shapes that should be solid are not. Each form has been evacuated, revealing a structured absence at its core. The geometry remains perfect. The substance is somewhere else.",
            "136", "490.00"
        },
        {
            "Migratory Data",
            "Thousands of individual data points plotted along routes that mirror bird migration paths. The birds don't know they're data. The data doesn't know it's beautiful.",
            "137", "330.00"
        },
        {
            "Umbra Studies I",
            "The first in a series exploring shadow as subject rather than absence. The shadow here has more presence, more weight, more intention than the object casting it.",
            "138", "445.00"
        },
        {
            "Cerulean Protocol",
            "A system of blue lines crossing a white field, each intersection marking a decision point. The routes through are infinite; the directions to follow them are missing.",
            "139", "615.00"
        },
        {
            "Glass Meridian",
            "A landscape seen through a lens of ice or glass — distorted, clarified, and distorted again. Mediation changes what we see. We are always looking through something.",
            "140", "760.00"
        },
        {
            "Phantom Grid",
            "The skeleton of a city that was planned but never built. All the infrastructure of human habitation, rendered in ghostly pale lines on a dark ground, waiting to be inhabited.",
            "141", "395.00"
        },
        {
            "Verdant Collapse",
            "Ecological anxiety expressed as beauty. A lush rainforest canopy at the exact moment before something irreversible happens. The greens are too green. The light is too golden.",
            "142", "870.00"
        },
        {
            "Iridescent Wound",
            "Damage rendered in the colours of a rainbow slick on water. The injury is real; the beauty does not cancel it out; neither does the injury cancel out the beauty.",
            "143", "580.00"
        },
        {
            "Deep Map",
            "A map of a place that does not exist, drawn with the conviction of a surveyor. The rivers run correctly; the contours make physical sense; the names are in no known language.",
            "144", "440.00"
        },
        {
            "Solstice Engine",
            "The mechanics behind the longest day of the year: celestial geometry made visible, each orbit and tilt rendered with the reverence usually reserved for sacred diagrams.",
            "145", "680.00"
        },
        {
            "Micro Cosmos",
            "A single drop of water from a forest stream, magnified until it becomes a universe. Everything is scale. At the right magnification, any fragment of the world is everything.",
            "146", "255.00"
        },
        {
            "Archive Fever",
            "The anxiety of too much information: files, folders, documents, photographs, all piling up faster than they can be sorted or understood. The accumulation is the subject.",
            "147", "370.00"
        },
        {
            "The Unmoved Mover",
            "A vast, still form at the centre of a composition of pure motion. Something needs to be still for everything else to move. This is that thing.",
            "148", "940.00"
        },
        {
            "Petrichor Index",
            "The smell of rain on dry earth translated into colour and texture. Synesthesia as method. This smells like something you have been waiting for without knowing.",
            "149", "315.00"
        },
        {
            "Dissolved Frontier",
            "A border that has become unclear — geographic, temporal, or personal. The dissolution is not a failure of definition; it is an invitation to inhabit the space between.",
            "150", "555.00"
        },
        {
            "Noise Garden",
            "A field of controlled randomness — visual noise cultivated until it becomes composition. The difference between static and signal is only a matter of attention.",
            "151", "290.00"
        },
    };

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Cleaning database (dev seeder)...");
        clearDatabase();

        log.info("Seeding {} artists and {} artworks...", ARTISTS.length, ARTWORKS.length);
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
        for (String[] artist : ARTISTS) {
            Account account = Account.builder()
                .username(artist[0])
                .email(artist[2])
                .password(passwordEncoder.encode("password123"))
                .build();
            accounts.add(accountRepository.save(account));
        }
        return accounts;
    }

    private void seedArtworks(List<Account> accounts) {
        if (accounts.isEmpty()) return;

        Random random = new Random(42);
        List<Artwork> artworks = new ArrayList<>();
        Instant now = Instant.now();

        for (int i = 0; i < ARTWORKS.length; i++) {
            String[] data    = ARTWORKS[i];
            Account creator  = accounts.get(i % accounts.size());

            // Spread creation dates over the past 12 months
            Instant createdAt = now.minus(random.nextInt(365), ChronoUnit.DAYS)
                                   .minus(random.nextInt(24), ChronoUnit.HOURS);

            Artwork artwork = Artwork.builder()
                .title(data[0])
                .description(data[1])
                .price(new BigDecimal(data[3]))
                .creator(creator)
                .views(random.nextInt(1200))
                .createdAt(createdAt)
                .build();

            artworks.add(artwork);
        }

        artworkRepository.saveAll(artworks);
    }
}

