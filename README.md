# CNE-project

Repository for CNE group 2

---

# Galerique — Cloud Native Engineering Project (Group 2)

Galerique is a luxury digital art gallery platform. Artists can upload and sell digital artworks; collectors can browse, like and purchase them. The project consists of a Spring Boot REST API backend and a Next.js frontend.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Architecture](#architecture)
4. [Prerequisites](#prerequisites)
5. [Database Setup](#database-setup)
6. [Backend Setup](#backend-setup)
7. [Frontend Setup](#frontend-setup)
8. [Running the Application](#running-the-application)
9. [Swagger / API Documentation](#swagger--api-documentation)
10. [Authentication](#authentication)
11. [Frontend Styling](#frontend-styling)
12. [Project Structure](#project-structure)
13. [Seed Data](#seed-data)

---

## Project Overview

| Layer    | Technology              | Port (default) |
| -------- | ----------------------- | -------------- |
| Backend  | Spring Boot 4 / Java 21 | `8080`         |
| Frontend | Next.js 16 / React 19   | `3000`         |
| Database | MongoDB (local)         | `5432`         |

---

## Tech Stack

### Backend

| Dependency                  | Purpose                                           |
| --------------------------- | ------------------------------------------------- |
| Spring Boot 4.0.2           | Application framework                             |
| Spring Web MVC              | REST controllers                                  |
| Spring Data JPA / Hibernate | ORM & database access                             |
| Spring Security             | Stateless cookie-based authentication             |
| Spring Validation           | Bean validation (`@NotBlank`, `@Email`, etc.)     |
| Springdoc OpenAPI 2.8.5     | Auto-generated Swagger UI                         |
| Lombok                      | Boilerplate reduction (`@Data`, `@Builder`, etc.) |
| dotenv-java 3.0.2           | Loads `.env` file into Spring environment         |

### Frontend

| Dependency                                 | Purpose                      |
| ------------------------------------------ | ---------------------------- |
| Next.js 16 (App Router)                    | React framework with SSR/SSG |
| React 19                                   | UI library                   |
| TypeScript 5                               | Static typing                |
| Tailwind CSS v4                            | Utility-first CSS framework  |
| Lucide React                               | Icon library                 |
| Google Fonts (Inter + Bricolage Grotesque) | Typography                   |

---

## Architecture

```
Browser
  └── Next.js Frontend (localhost:3000)
        └── fetch() with credentials: "include"
              └── Spring Boot Backend (localhost:8080)
                    └── MongoDB (localhost:27017)
```

- The frontend communicates with the backend via a REST API.
- Authentication uses an **HTTP-only session cookie** (`cloud_native_engeneering_group2_session`). The backend is fully stateless — no server sessions; the cookie value is a token UID that is validated against the `tokens` table in the database.
- CORS is configured on the backend to allow requests from the frontend origins defined in the `.env` file.

---

## Prerequisites

Make sure the following are installed before setting up the project:

- **Java 21** (JDK) — [Download](https://adoptium.net/)
- **Maven** (or use the included `mvnw` wrapper)
- **Node.js 20+** and **npm** — [Download](https://nodejs.org/)
- **pgAdmin** (optional, recommended GUI) — [Download](https://www.pgadmin.org/)
- **VS Code** with the [Spring Boot Dashboard extension](https://marketplace.visualstudio.com/items?itemName=vscjava.vscode-spring-boot-dashboard)
- **Docker Desktop** — [Download](https://docs.docker.com/desktop/setup/install/windows-install/)

---

## Running the application

### Back-end setup

1. Create a .env in the `backend/` directory

```sh
SERVER_PORT=8080


DB_HOST=localhost
DB_PORT=27017
DB_NAME=cloudnativeengineeringproject
DB_USERNAME=mongo
DB_PASSWORD=mongo

FRONTEND_URLS=http://localhost:3000,http://localhost:3001

SPRING_PROFILES_ACTIVE=dev

AZURITE_CONNECTION_STRING=INSERTSTRINGHERE
```

2. Create an application.yaml in `backend/src/main/resources/`

```yaml
spring:
    application:
        name: cloud-native-engineering-project-group2-backend

    jpa:
        hibernate:
            ddl-auto: update

    mongodb:
        uri: mongodb://${DB_USERNAME:admin}:${DB_PASSWORD:password}@${DB_HOST:localhost}:${DB_PORT:27017}/${DB_NAME:artworks}?authSource=admin

    servlet:
        multipart:
            max-file-size: 5MB
            max-request-size: 20MB

server:
    port: 8080

springdoc:
    api-docs:
        path: /v3/api-docs
    swagger-ui:
        path: /swagger-ui.html
        enabled: true

app:
    cors:
        allowed-origins: http://localhost:3000
    blob:
        connection-string: ${AZURITE_CONNECTION_STRING:}
        container-name: artworks
    artwork-images:
        max-images-per-artwork: 10
        max-file-size-bytes: 5242880
        max-total-upload-size-bytes: 20971520
        thumbnail-max-width: 300
```

---

The application uses **MongoDB** and we will use docker to run it locally

1. Open a terminal in the project root folder
2. Run the following to install and run the docker image

```sh
docker-compose up -d
```

3. Run the following to stop the container

```sh
docker-compose down
```

---

### Front-end setup

1.  Create a `.env.local` file in the `frontend/` directory:

```dotenv
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

This variable is used by all frontend service files (e.g. `auth.service.ts`, `artwork.service.ts`) to construct API call URLs.

2. Download the dependencies

```bash
cd frontend
npm install
```

---

wrapper, but make sure you are in the `backend/` directory so dotenv finds the `.env` file:

### Starting the back-end

> ### Make sure the docker container is running before you run the backend
>
> ```bash
> cd backend
> ./mvnw spring-boot:run
> ```
>
> On Windows:
>
> ```bat
> cd backend
> mvnw.cmd spring-boot:run
> ```

### Starting the front-end

> ```bash
> cd frontend
> npm run dev
> ```
>
> The frontend starts on `http://localhost:3000`.

---

## Swagger / API Documentation

Once the backend is running, the interactive Swagger UI is available at:

```
http://localhost:8080/swagger-ui.html
```

The raw OpenAPI JSON spec is available at:

```
http://localhost:8080/v3/api-docs
```

### API Groups (tags)

| Tag         | Base path    | Description                                |
| ----------- | ------------ | ------------------------------------------ |
| `auth`      | `/auth`      | Login, logout, authentication status       |
| `accounts`  | `/accounts`  | Register, view and update user profiles    |
| `artworks`  | `/artworks`  | CRUD, search, trending, like/unlike        |
| `purchases` | `/purchases` | Purchase an artwork, view purchase history |

### Public vs Protected Endpoints

The following endpoints are accessible **without authentication**:

- `POST /accounts` — register a new account
- `GET /artworks`, `GET /artworks/{id}`, `GET /artworks/search`, `GET /artworks/trending`, `GET /artworks/{id}/likes`
- `GET /accounts`, `GET /accounts/{id}`, `GET /accounts/{id}/artworks`
- `POST /auth/login`
- All Swagger UI and OpenAPI spec routes

All other endpoints (create/update/delete artwork, purchase, like, logout, `/accounts/me`) **require an authenticated session cookie**.

---

## Authentication

The application uses a custom **stateless cookie-based token system** (not JWT):

1. The client calls `POST /auth/login` with `{ "identifier": "username_or_email", "password": "..." }`.
2. The backend validates the credentials, generates a unique token UID, stores it in the `tokens` table with an expiry, and sets an HTTP-only cookie named `cloud_native_engeneering_group2_session`.
3. On every subsequent request, the `AuthTokenFilter` reads that cookie, looks up the token in the database, and if valid/not-expired, sets the Spring Security context.
4. Calling `POST /auth/logout` clears the cookie. Passing `?hard=true` also revokes all tokens for that account.

The `remember` parameter on login (`POST /auth/login?remember=true`) extends the token expiry for a longer session.

---

## Frontend Styling

The frontend uses **Tailwind CSS v4** with the PostCSS plugin (`@tailwindcss/postcss`).

### Fonts

Two Google Fonts are used, loaded via `next/font/google` in `app/layout.tsx`:

| Font                    | CSS variable       | Usage                             |
| ----------------------- | ------------------ | --------------------------------- |
| **Inter**               | `--font-inter`     | Body text (`font-sans`)           |
| **Bricolage Grotesque** | `--font-bricolage` | Display headings (`font-display`) |

### Theme (Dark / Light / System)

Theme support is implemented via `SettingsContext` in `src/context/SettingsContext.tsx`:

- Three options: **Light**, **Dark**, **System** (follows OS preference).
- The selected theme is persisted in `localStorage` under the key `"theme"`.
- On change, the `"dark"` or `"light"` class is toggled on `<html>`.
- Tailwind uses the `dark:` variant (configured in `globals.css` with `@custom-variant dark (&:where(.dark, .dark *))`).

### CSS Variables

Defined in `app/globals.css`:

```css
:root {
	--background: #ffffff;
	--foreground: #18181b;
}

.dark {
	--background: #09090b;
	--foreground: #fafafa;
}
```

### Animations

Custom `@keyframes` animations are defined in `globals.css` and used as utilities:
`fade-in`, `fade-in-up`, `fade-in-down`, `scale-in`, `slide-in-right`, and scroll-reveal via `IntersectionObserver`.

---

## Project Structure

```
├── backend/
│   ├── src/main/java/com/group2/backend/
│   │   ├── config/          # CORS, Dotenv, Jackson, OpenAPI configuration
│   │   ├── controller/      # REST controllers (Account, Artwork, Auth, Purchase)
│   │   ├── dto/             # Data Transfer Objects (request/response bodies)
│   │   ├── exception/       # Custom exception classes & global error handler
│   │   ├── model/           # JPA entities (Account, Artwork, ArtworkLike, Purchase, Token)
│   │   ├── repository/      # Spring Data JPA repositories
│   │   ├── security/        # AuthTokenFilter + SecurityConfig
│   │   ├── seed/            # DatabaseSeeder (runs on "dev" profile only)
│   │   └── service/         # Business logic services
│   ├── src/main/resources/
│   │   └── application.yaml
│   └── .env                 # ← local environment variables (not committed)
│
└── frontend/
    ├── app/                 # Next.js App Router pages
    │   ├── page.tsx             # Home / gallery feed
    │   ├── artwork/[id]/        # Artwork detail page
    │   ├── profile/[id]/        # Artist profile page
    │   ├── trending/            # Trending artworks
    │   ├── purchases/           # Purchase history (authenticated)
    │   └── upload/              # Upload new artwork (authenticated)
    └── src/
        ├── components/      # Reusable UI components (Navbar, ArtworkCard, AuthModal, …)
        ├── context/         # React Contexts (AuthContext, SettingsContext)
        ├── services/        # API service modules (auth, account, artwork, purchase)
        └── types/           # TypeScript type definitions
```

---

## Seed Data

When the backend is started with `SPRING_PROFILES_ACTIVE=dev`, the `DatabaseSeeder` (`@Profile("dev")`) runs automatically on startup via `CommandLineRunner`.

It populates the database with:

- **20 artist accounts** (usernames like `evasquez`, `mchen_studio`, `aisha_creates`, …) — all with the password `Password1!`
- **60+ artworks** distributed across those artists, each with a title, description, price and a placeholder image URL
- Random **likes** and **views** spread across artworks

This gives you a fully populated gallery to work with locally without any manual data entry.

> Seed data is **skipped** if accounts already exist in the database, so it is safe to restart the application.
