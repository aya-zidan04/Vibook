-- Restrict all monetary currencies to JOD / USD. Normalize legacy seed values (SAR, AED, etc.).

UPDATE users
SET wallet_currency = 'JOD'
WHERE wallet_currency IN ('SAR', 'AED')
   OR wallet_currency NOT IN ('JOD', 'USD');

UPDATE bookings
SET currency = 'JOD'
WHERE currency IN ('SAR', 'AED')
   OR currency NOT IN ('JOD', 'USD');

UPDATE events
SET currency = 'JOD'
WHERE currency IN ('SAR', 'AED')
   OR currency NOT IN ('JOD', 'USD');

UPDATE ticket_tiers
SET currency = 'JOD'
WHERE currency IN ('SAR', 'AED')
   OR currency NOT IN ('JOD', 'USD');

UPDATE experiences
SET currency = 'JOD'
WHERE currency IN ('SAR', 'AED')
   OR currency NOT IN ('JOD', 'USD');

UPDATE hotels
SET currency = 'JOD'
WHERE currency IN ('SAR', 'AED')
   OR currency NOT IN ('JOD', 'USD');

UPDATE flights
SET currency = 'JOD'
WHERE currency IN ('SAR', 'AED')
   OR currency NOT IN ('JOD', 'USD');

UPDATE packages
SET currency = 'JOD'
WHERE currency IN ('SAR', 'AED')
   OR currency NOT IN ('JOD', 'USD');

ALTER TABLE users
    ALTER COLUMN wallet_currency SET DEFAULT 'JOD';

ALTER TABLE users
    ADD CONSTRAINT chk_users_wallet_currency CHECK (wallet_currency IN ('JOD', 'USD'));

ALTER TABLE bookings
    ADD CONSTRAINT chk_bookings_currency CHECK (currency IN ('JOD', 'USD'));

ALTER TABLE events
    ADD CONSTRAINT chk_events_currency CHECK (currency IN ('JOD', 'USD'));

ALTER TABLE ticket_tiers
    ADD CONSTRAINT chk_ticket_tiers_currency CHECK (currency IN ('JOD', 'USD'));

ALTER TABLE experiences
    ADD CONSTRAINT chk_experiences_currency CHECK (currency IN ('JOD', 'USD'));

ALTER TABLE hotels
    ADD CONSTRAINT chk_hotels_currency CHECK (currency IN ('JOD', 'USD'));

ALTER TABLE flights
    ADD CONSTRAINT chk_flights_currency CHECK (currency IN ('JOD', 'USD'));

ALTER TABLE packages
    ADD CONSTRAINT chk_packages_currency CHECK (currency IN ('JOD', 'USD'));
