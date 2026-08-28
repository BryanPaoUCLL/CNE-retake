# Galerique

Galerique is a cloud-native digital art marketplace. Artists can publish artwork and collectors can browse, like, and purchase it. The application consists of a Next.js frontend and a Spring Boot REST API backed by managed Azure data services.

This repository is the Cloud Native Engineering retake by Bryan Pao. The original starting point is identified by the commit named `Merge branch 'main' into cloud-migration`.

## Live application

- Frontend: <https://cne-retake-frontend.mangodesert-0338b5a6.francecentral.azurecontainerapps.io>
- Backend health: <https://cne-retake-backend.mangodesert-0338b5a6.francecentral.azurecontainerapps.io/actuator/health>
- Backend OpenAPI: <https://cne-retake-backend.mangodesert-0338b5a6.francecentral.azurecontainerapps.io/swagger-ui.html>

## Cloud architecture

The deployed design, decision trade-offs, scaling model, security model, cost controls, and presentation notes are documented in [Cloud architecture](docs/cloud-architecture.md).

| Concern | Technology |
| --- | --- |
| Frontend | Next.js 16 and React 19 |
| Backend | Spring Boot 4 and Java 21 |
| Compute | Azure Container Apps Consumption |
| Database | Azure Cosmos DB for MongoDB RU, serverless |
| Image storage | Azure Blob Storage |
| Cache | In-process Caffeine caches |
| Container registry | GitHub Container Registry |
| Delivery | GitHub Actions with Azure OIDC |
| Observability | Log Analytics and Spring Boot Actuator |

## Run locally

### Prerequisites

- Java 21
- Maven 3.9+
- Node.js 20+
- Docker Desktop

Start the local MongoDB and Azurite emulators from the repository root:

```powershell
docker compose up -d
```

Create `backend/.env` with local, non-production settings:

```dotenv
SPRING_PROFILES_ACTIVE=dev
MONGODB_URI=mongodb://mongo:mongo@localhost:27017/cloudnativeengineeringproject?authSource=admin
AZURITE_BLOB_CONTAINER=artworks
APP_SEEDING_ENABLED=false
```

Start the backend:

```powershell
cd backend
mvn spring-boot:run
```

Create `frontend/.env.local`:

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

In another terminal, start the frontend:

```powershell
cd frontend
npm ci
npm run dev
```

Open <http://localhost:3000>. Stop the local infrastructure with `docker compose down` when finished.

## Tests

```powershell
cd backend
mvn test
```

```powershell
cd frontend
npm ci
npm run lint
```

Both checks run automatically before their respective production deployment.

## Configuration and secrets

Production configuration is supplied through Container App environment variables and secret references. Local `.env` files, Azure connection strings, and credentials are ignored by Git and must never be committed.

Important configuration names include:

- `MONGODB_URI`
- `AZURE_STORAGE_CONNECTION_STRING`
- `AZURE_STORAGE_CONTAINER`
- `FRONTEND_URLS`
- `SPRING_PROFILES_ACTIVE`
- `APP_SEEDING_ENABLED`
- `COOKIE_SAME_SITE`
- `NEXT_PUBLIC_BACKEND_URL`

The destructive development seeder is disabled by default. See [backend/SEEDING.md](backend/SEEDING.md) before enabling it.

## Deployment

A push to `main` triggers path-filtered workflows:

- Backend changes run Maven tests, build the backend image, push `latest` and commit-SHA tags, then deploy `cne-retake-backend`.
- Frontend changes run ESLint, build the frontend image with its public backend URL, push `latest` and commit-SHA tags, then deploy `cne-retake-frontend`.

GitHub authenticates to Azure using short-lived OIDC tokens through the `github-cne-retake-deployer` managed identity. No Azure client secret is stored in GitHub.
