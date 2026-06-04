# Smoke / E2E user cleanup — execution report

**Date:** 2026-06-04  
**Database:** `vibook_db` @ `localhost:3306`

## Before / after counts

| Metric | Before | After |
|--------|--------|-------|
| Total `users` rows | **10** | **6** |
| Smoke/E2E users (predicate) | **4** | **0** |
| `ROLE_ADMIN` accounts kept | 1 (`admin@gmail.com`) | 1 |

### Users removed (4)

| id | email |
|----|-------|
| 9 | smoke_1780446838@vibook.test |
| 10 | smoke8080_1780446967@vibook.test |
| 11 | smoke8080b_1780446971@vibook.test |
| 12 | biz_1780446979@vibook.test |

### Users kept (6)

| id | email | roles |
|----|-------|-------|
| 1 | aya@test.com | ROLE_USER |
| 2 | isaraa@test.com | ROLE_USER |
| 3 | admin@test.com | ROLE_USER |
| 4 | aliomar@gmail.com | ROLE_USER, ROLE_BUSINESS |
| 5 | admin@gmail.com | ROLE_USER, ROLE_ADMIN |
| 6 | jomana@gmail.com | ROLE_USER, ROLE_BUSINESS |

**Note:** `@test.com` dev mailboxes were **not** deleted (predicate excludes generic `@test.` domains).

## Related rows deleted

| Step | Rows affected |
|------|----------------|
| INSERT tmp_smoke_user_ids | 4 |
| INSERT tmp_smoke_event_ids | 0 |
| INSERT tmp_smoke_booking_ids | 0 |
| DELETE payments | 0 |
| DELETE bookings | 0 |
| DELETE event_ratings | 0 |
| DELETE event_favorites | 0 |
| DELETE user_reports | 0 |
| DELETE moderation_reports | 0 |
| DELETE payment_methods | 0 |
| DELETE refresh_tokens | 0 |
| DELETE business_event_photos | 0 |
| DELETE business_event_time_slots | 0 |
| DELETE business_events | 0 |
| DELETE business_profiles | **2** |
| DELETE admin_activity_logs | 0 |
| DELETE user_roles | 4 |
| DELETE users | **4** |

## API change

`UserServiceImpl.getAllUsers()` no longer filters test accounts — admin Users list count = DB `users` count (**6**).

## Verification

- `SELECT` for `@vibook.test` / `smoke%` / `biz_%` → **0 rows**
- `./mvnw test` → **PASS**

## Script used

`backend/scripts/run-smoke-user-cleanup.py` (same logic as `cleanup-smoke-test-users-execute.sql`)
