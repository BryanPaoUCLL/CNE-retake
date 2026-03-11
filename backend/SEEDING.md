# Dev Seeding

This backend has a dev seeder that loads local metadata and images, then creates demo users, artworks, likes, and purchases.

## What Is Used

- Seeder code: `src/main/java/com/group2/backend/seed/DatabaseSeeder.java`
- Seeder config: `src/main/resources/seed/dev-seed.json`
- Optional metadata downloader: `src/main/java/com/group2/backend/seed/seeder.py`
- Local artwork folders: `downloaded_artworks/`

## Local Artwork Structure

The seeder expects each artwork folder under `downloaded_artworks/` to contain:

- `metadata.json`
- One or more image files (`.jpg`, `.jpeg`, `.png`, `.webp`)

Minimal `metadata.json` example:

```json
{
	"title": "Artwork title",
	"description": "Optional description",
	"artist": "Artist name",
	"year": 1889,
	"tags": ["impressionism", "oil", "landscape"]
}
```

## Account Seeding Rules

`dev-seed.json` defines exactly 10 demo accounts with a mix of:

- creators
- buyers
- creator_buyers

It also controls ranges for:

- number of artworks
- random likes
- random purchases
- generated views

## Run Seeder

The seeder runs automatically when the `dev` profile is active.

Example:

```powershell
$env:SPRING_PROFILES_ACTIVE='dev'; .\mvnw.cmd spring-boot:run
```

## Notes

- `downloaded_artworks/` is intentionally gitignored for local use.
- Commit shared defaults in `dev-seed.json`.
- Keep personal overrides in `*.local.json` files (also gitignored).
