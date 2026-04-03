# Vibook backend

Spring Boot API for the **Vibook** mobile app. This module follows the layered planning document: entities and migrations first, JWT auth, then catalog, profile, ratings, bookings, and partner flows.

## Why PostgreSQL

PostgreSQL is the default for this project because it offers:

- Strong SQL compliance, constraints, and indexing for normalized catalog and booking data
- Mature JSON support if you later store flexible listing payloads or notification metadata
- Excellent Spring Boot / Flyway tooling and hosting options (RDS, Cloud SQL, managed Postgres)

MySQL remains a viable alternative; the schema uses standard SQL types portable to both.

## Tech stack

- Java **21**, Maven, Spring Boot **3.4**
- Spring Web, Data JPA, Security, Validation, Actuator
- **Flyway** migrations under `src/main/resources/db/migration`
- **JWT** (access) + **opaque refresh tokens** (hashed at rest with SHA-256)
- BCrypt (strength 12) for passwords

## Package layout

| Package | Responsibility |
|---------|------------------|
| `com.vibook` | `VibookApplication`, `@ConfigurationPropertiesScan`, `@EnableJpaAuditing` |
| `com.vibook.config` | Security, JWT properties, password encoder beans |
| `com.vibook.entity` | JPA entities and enums |
| `com.vibook.repository` | Spring Data repositories |
| `com.vibook.service` | Transactions and use cases |
| `com.vibook.web.controller` | REST adapters |
| `com.vibook.web.dto` | Request/response records (no entities in API) |
| `com.vibook.security` | JWT issue/parse filter, principal, token hashing |
| `com.vibook.exception` | `ApiError` + `@RestControllerAdvice` |

## Configuration

Set via environment variables or JVM system properties. **Either** naming style works for the database (first match wins):

| Variable | Aliases | Purpose |
|----------|---------|---------|
| JDBC URL | `DB_URL` or `DATABASE_URL` | Default `jdbc:postgresql://localhost:5432/vibook?sslmode=disable&tcpKeepAlive=true` |
| DB user | `DB_USERNAME` or `DATABASE_USERNAME` | Default `vibook` (non-`prod` only if blank) |
| DB password | `DB_PASSWORD` or `DATABASE_PASSWORD` | Default `vibook` (non-`prod` only if blank) |
| `JWT_SECRET` | — | HMAC secret; **required** with profile `prod`. If unset locally, a dev-only default is applied and a **WARN** is logged. |
| `JWT_ACCESS_MINUTES` | — | Access token TTL (default 15) |
| `JWT_REFRESH_DAYS` | — | Refresh token TTL (default 7) |
| `SERVER_PORT` | — | Default 8080 |

**Profiles:** `prod` requires `DB_*`/`DATABASE_*` and `JWT_SECRET` (see `application.yml` — missing values fail fast with a clear placeholder error). Default profile uses YAML + optional local fallbacks from `VibookEnvironmentBootstrap` when values are blank.

On startup failures (DB down, bad password, missing DB), Spring Boot prints an **action** block from `VibookDatabaseFailureAnalyzer`.

## Run locally

1. Start PostgreSQL. Quickest option from `backend/`:

   ```bash
   docker compose up -d
   ```

   Wait until healthy (`docker compose ps`), or use your own Postgres with database/user `vibook` / `vibook`.

2. From `backend/`:

```bash
./mvnw spring-boot:run
```

Flyway applies `V1__init_users_and_auth.sql` on startup. Hibernate runs with `ddl-auto: validate` so the schema is owned by migrations.

## API (phase 1–4)

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/auth/register` | Public |
| POST | `/api/v1/auth/login` | Public |
| POST | `/api/v1/auth/refresh` | Public (refresh body) |
| POST | `/api/v1/auth/logout` | Bearer access token |
| GET | `/api/v1/cities` | Public |
| GET | `/api/v1/categories` | Public |
| GET | `/api/v1/cuisines` | Public |
| GET | `/api/v1/me` | Bearer access token |
| PATCH | `/api/v1/me` | Bearer access token |

### Register / login / profile response shape (`UserResponse`)

- `firstName`, `lastName`, **`fullName`** (concatenated), `nameAr`, `phone`, `preferredLanguage`, `avatarUrl`, `membershipTier`, wallet fields, **`cityId`** (nullable), `email` (immutable via PATCH).

### PATCH `/me`

- Only non-null JSON fields are applied. **`unsetCity: true`** clears `cityId` (cannot combine with `cityId` in the same request).

### Catalog (read-only, public GET)

Structured page: `{ "content": [...], "page": 0, "size": 20, "totalElements": N, "totalPages": M }`.

| Method | Path | Query params |
|--------|------|----------------|
| GET | `/api/v1/organizers/{id}` | — |
| GET | `/api/v1/events` | `cityId`, `categoryId`, `organizerId`, `q`, `page`, `size`, `sort` |
| GET | `/api/v1/events/{id}` | — |
| GET | `/api/v1/events/{id}/tiers` | — |
| GET | `/api/v1/restaurants` | `cityId`, `cuisineId`, `q`, `page`, `size`, `sort` |
| GET | `/api/v1/restaurants/{id}` | — |
| GET | `/api/v1/experiences` | `cityId`, `categoryId`, `q`, `page`, `size`, `sort` |
| GET | `/api/v1/experiences/{id}` | — |
| GET | `/api/v1/hotels` | `cityId`, `q`, `page`, `size`, `sort` |
| GET | `/api/v1/hotels/{id}` | — |
| GET | `/api/v1/flights` | `q`, `from`, `to` (IATA-style codes), `page`, `size`, `sort` |
| GET | `/api/v1/flights/{id}` | — |
| GET | `/api/v1/packages` | `cityId` (packages touching that city), `q`, `page`, `size`, `sort` |
| GET | `/api/v1/packages/{id}` | — |
| GET | `/api/v1/offers` | `q`, `page`, `size`, `sort` |

### User interactions (ratings, favorites, bookings)

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/me/ratings` | Bearer |
| PUT | `/api/v1/me/ratings/{vertical}/{refId}` | Bearer — body `{ "stars": 1–5 }` or `{ "stars": null }` to clear; `vertical` is `event`, `restaurant`, `experience`, `stay` or `hotel`, `organizer`, `package`, `flight` |
| GET | `/api/v1/me/favorites` | Bearer — lightweight `{ type, refId, createdAt }[]` for catalog hydration on the client |
| PUT | `/api/v1/me/favorites/{type}/{refId}` | Bearer — idempotent add |
| DELETE | `/api/v1/me/favorites/{type}/{refId}` | Bearer |
| POST | `/api/v1/bookings` | Bearer — create (see `CreateBookingRequest` in code) |
| GET | `/api/v1/me/bookings` | Bearer |
| GET | `/api/v1/me/bookings/{id}` | Bearer |
| POST | `/api/v1/bookings/{id}/cancel` | Bearer |

### Wallet, vouchers, membership, notifications

Monetary **currency** is restricted to **`JOD`** and **`USD`** (see `Currency` enum, Flyway `V6`, and DB `CHECK` constraints).

| Method | Path | Auth |
|--------|------|------|
| GET | `/api/v1/me/wallet` | Bearer |
| GET | `/api/v1/me/vouchers` | Bearer |
| POST | `/api/v1/me/vouchers/redeem` | Bearer — `{ "code": "..." }` |
| GET | `/api/v1/membership/plans` | Public |
| GET | `/api/v1/me/membership` | Bearer |
| POST | `/api/v1/me/membership/subscribe` | Bearer — `{ "planId": 1, "paymentReference": "optional-stub" }` |
| GET | `/api/v1/me/notifications` | Bearer |
| PATCH | `/api/v1/me/notifications/{id}` | Bearer — `{ "read": true }` |
| POST | `/api/v1/me/notifications/read-all` | Bearer — 204 |

### Business (minimal)

| Method | Path | Auth |
|--------|------|------|
| POST | `/api/v1/business/leads` | Public — join / partner interest (`CreateBusinessLeadRequest`) |

**Sort tokens** (invalid value → 400): see `CatalogSort` — e.g. events: `start_at_asc`, `start_at_desc`, `price_asc`, `price_desc`, `rating_desc`, `relevance`.

**IDs** are numeric (`long` in JSON). Mobile string IDs should map to these after integration.

## Next implementation phases

1. Admin review of `business_applications`, scoped BUSINESS role, business-owned listings when a frontend exists  
2. Admin endpoints on top of existing `ROLE_ADMIN` seed  

## Security notes

- Refresh tokens are stored as **SHA-256 hex**; only the raw token is returned once per issuance.
- Refresh **rotation**: `/auth/refresh` revokes the presented token and issues a new pair.
- Login revokes all active refresh tokens for that user (single-session style; adjust if you need multi-device).
