# ViBook

> Discover. Book. Experience.

A full-stack **events marketplace for Jordan** that connects users, business partners, and administrators in app and web.

Built as a graduation project using **Spring Boot, React Native, and React**.

---

## Overview

ViBook is a multi-role events platform designed to simplify event discovery, booking, and management in Jordan.

It supports:
- Users (browse & book events)
- Business partners (create & manage events)
- Admins (moderation & analytics)

---

## Mobile App

### Start screen

![Start](photos_ViBook/app/start.png)

### Login & Create Account

![Login](photos_ViBook/app/login.png)
![Creat_Account](photos_ViBook/app/creat_acc.png)

### Explore & Search 

![Explore](photos_ViBook/app/exp.png)
![Search](photos_ViBook/app/search.png)

### Booking & Favorite

![Booking](photos_ViBook/app/booking.png)
![Favorite](photos_ViBook/fav/fav.png)

### Profile

![Profile1](photos_ViBook/app/me1.png)
![Profile2](photos_ViBook/fav/me2.png)
![Profile3](photos_ViBook/fav/me3.png)

---

## Business Panel

### Hub

![Hub](photos_ViBook/app/hub.png)

### Events

![Events](photos_ViBook/app/events.png)

### Books

![Books](photos_ViBook/app/books.png)

### Profile

![Profile1](photos_ViBook/app/business1.png)
![Profile2](photos_ViBook/app/business2.png)

---

## Admin Dashboard

### Login Admin

![Login](photos_ViBook/web_admin/login_admin.png)

### Dashboard

![Dashboard](photos_ViBook/web_admin/dashboard.png)

### Business profiles

![Business_profiles](photos_ViBook/web_admin/businessProfiles.png)


### Users

![Users](photos_ViBook/web_admin/users.png)


### Events

![Events](photos_ViBook/web_admin/events.png)


### Bookings

![Bookings](photos_ViBook/web_admin/bookings.png)


### Ratings 

![Ratings](photos_ViBook/web_admin/ratings.png)


### Reports

![Reports](photos_ViBook/web_admin/reports.png)

### Categories

![Categories](photos_ViBook/web_admin/categories.png)

### Governorates

![Governorates](photos_ViBook/web_admin/govs.png)

### Settings

![Settings](photos_ViBook/web_admin/settings.png)

---

## Features

### Users
- Event discovery with filters (governorate, category, subcategory)
- Guest browsing + authenticated booking system
- JWT authentication (register / login / logout)
- Favorites, bookings, cancellations, ratings
- User reports system
- English & Arabic UI with RTL support
- Light/Dark mode

### Business Partners
- Business profile application (admin approval required)
- Full CRUD for events
- Upload images, schedules, and manage visibility
- Booking management system

### Admin
- Analytics dashboard
- Business approvals (bulk actions)
- Event & booking moderation
- User reports handling
- System activity tracking

---

## Backend

- REST API (`/api/v1`)
- Java 21 + Spring Boot 3.3.4
- Spring Security (JWT + RBAC)
- MySQL database (19 tables, 18 entities)
- Multipart image upload system
- PayPal Sandbox integration (demo payments)

---

## Tech Stack

### Backend
Java 21 · Spring Boot · Spring Security · Spring Data JPA · MySQL · Maven

### Mobile
React Native · Expo · TypeScript · Zustand · AsyncStorage · expo-router

### Admin Panel
React 19 · Vite · TypeScript · Recharts · Axios

---

## Architecture

```mermaid
flowchart LR
    subgraph Clients
        M[📱 Mobile<br/>Expo]
        A[🖥️ Admin<br/>Vite]
    end
    API[ Spring Boot<br/>REST + JWT]
    DB[( MySQL)]
    PP[ PayPal<br/>Sandbox]
    FS[ uploads/]

    M --> API
    A --> API
    API --> DB
    API --> FS
    API --> PP
```
---
Layered Architecture:
**Controller → Service → Repository → Entity**

## Project Structure

```
ViBook/
├── backend/          # Spring Boot API, JPA, security, PayPal
│   └── db/schema/    # SQL, ERD, Mermaid diagrams
├── mobile/           # Expo app — consumer + business partner
│   ├── app/          # expo-router screens & tabs
│   └── src/          # api, components, store, i18n, theme
├── admin-web/        # React admin console
└── docs/             # Handoff, remote access, architecture notes
```
---

## Quick Start

**Prerequisites:** 
Java 21 · Node 20+ · MySQL 8

```bash
git clone https://github.com/aya-zidan04/ViBook.git && cd ViBook
```

**Backend** — `cd backend` → `cp .env.example .env` → edit DB + `JWT_SECRET` → `./mvnw spring-boot:run`  
→ `http://localhost:8080/api/v1`

**Mobile** — `cd mobile` → `npm i` → `cp .env.example .env` → set `EXPO_PUBLIC_API_URL` → `npx expo start -c`

**Admin** — `cd admin-web` → `npm i` → `npm run dev`  
→ `http://localhost:5173` (proxies API to :8080)


| App     | Env file         | Key variables                    |
| ------- | ---------------- | -------------------------------- |
| Backend | `backend/.env`   | `DB_`*, `JWT_SECRET`, `PAYPAL_*` |
| Mobile  | `mobile/.env`    | `EXPO_PUBLIC_API_URL`            |
| Admin   | `admin-web/.env` | `VITE_API_BASE_URL` (optional)   |


> Copy from `*.env.example` only — **never commit** real `.env` files.

Physical device? Use your machine's LAN IP in the mobile `.env`. See `[docs/REMOTE_ACCESS.md](docs/REMOTE_ACCESS.md)`.

---

## API Overview


| Group                                                           | What it does                          |
| --------------------------------------------------------------- | ------------------------------------- |
| `/auth`                                                         | Register, login, refresh, logout      |
| `/events` · `/categories` · `/governorates`                     | Public catalog                        |
| `/bookings` · `/favorites` · `/users/me`                        | Consumer (JWT)                        |
| `/business-profile` · `/business/events` · `/business/bookings` | Partner hub (JWT)                     |
| `/payments/paypal`                                              | Sandbox checkout (JWT)                |
| `/admin/`*                                                      | Moderation & analytics (`ROLE_ADMIN`) |


Full reference → `[docs/GRADUATION_PROJECT_HANDOFF.md](docs/GRADUATION_PROJECT_HANDOFF.md)`

---

## Security

- **JWT** access + refresh tokens · stateless sessions
- **BCrypt** password hashing
- **RBAC** — `ROLE_USER` · `ROLE_BUSINESS` · `ROLE_ADMIN`
- **Secrets** in `.env` (gitignored) — templates in `*.env.example`
- **Upload validation** — MIME whitelist, size limits, UUID filenames, path normalization

---

## Future Improvements

- Real PayPal redirect flow (`create-order` → `capture-order`)
- Password reset · premium billing · wallet & vouchers APIs
- Push notifications · rate limiting on auth
- Production migrations (Flyway/Liquibase) · `ddl-auto: validate`
- Admin refresh-token sessions · E2E test suite

---

## Developer

**Aya Zidan** — full-stack design & implementation

---

## License

MIT License — see [LICENSE](LICENSE) or the notice below.

```
Copyright (c) 2026 Aya Zidan
Permission is hereby granted, free of charge, to any person obtaining a copy
of this software to use, modify, and distribute it under the MIT License terms.
```

---

## Acknowledgements

Built as a **graduation project** demonstrating end-to-end software engineering — from mobile UX and REST API design to database modeling, authentication, and platform moderation.

---
**ViBook**

*Events marketplace · Jordan*

⭐ Star this repo if you found it useful
