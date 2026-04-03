-- Catalog: one table per vertical (matches distinct mobile DTOs). Reference cities/categories/cuisines from V2.

CREATE TABLE organizers (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(200) NOT NULL,
    logo_url      VARCHAR(1024) NOT NULL,
    cover_url     VARCHAR(1024) NOT NULL,
    verified      BOOLEAN      NOT NULL DEFAULT FALSE,
    about         TEXT         NOT NULL,
    rating        NUMERIC(4, 2) NOT NULL,
    review_count  INT          NOT NULL DEFAULT 0
);

CREATE TABLE events (
    id            BIGSERIAL PRIMARY KEY,
    title         VARCHAR(500) NOT NULL,
    category_id   BIGINT       NOT NULL REFERENCES categories (id),
    city_id       BIGINT       NOT NULL REFERENCES cities (id),
    organizer_id  BIGINT       NOT NULL REFERENCES organizers (id),
    image_url     VARCHAR(1024) NOT NULL,
    gallery       JSONB        NOT NULL DEFAULT '[]'::jsonb,
    start_at      TIMESTAMPTZ  NOT NULL,
    end_at        TIMESTAMPTZ  NOT NULL,
    venue_name    VARCHAR(300) NOT NULL,
    address       TEXT         NOT NULL,
    description   TEXT         NOT NULL,
    price_from    NUMERIC(19, 4) NOT NULL,
    currency      CHAR(3)      NOT NULL,
    rating        NUMERIC(4, 2) NOT NULL,
    review_count  INT          NOT NULL DEFAULT 0,
    badge         VARCHAR(32)
);

CREATE INDEX idx_events_city ON events (city_id);
CREATE INDEX idx_events_category ON events (category_id);
CREATE INDEX idx_events_organizer ON events (organizer_id);
CREATE INDEX idx_events_start_at ON events (start_at);

CREATE TABLE ticket_tiers (
    id          BIGSERIAL PRIMARY KEY,
    event_id    BIGINT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    name        VARCHAR(200) NOT NULL,
    price       NUMERIC(19, 4) NOT NULL,
    currency    CHAR(3) NOT NULL,
    remaining   INT
);

CREATE INDEX idx_ticket_tiers_event ON ticket_tiers (event_id);

CREATE TABLE ticket_tier_benefits (
    tier_id    BIGINT       NOT NULL REFERENCES ticket_tiers (id) ON DELETE CASCADE,
    sort_index INT          NOT NULL,
    benefit    VARCHAR(500) NOT NULL,
    PRIMARY KEY (tier_id, sort_index)
);

CREATE TABLE restaurants (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(300) NOT NULL,
    city_id       BIGINT       NOT NULL REFERENCES cities (id),
    image_url     VARCHAR(1024) NOT NULL,
    price_level   SMALLINT     NOT NULL,
    rating        NUMERIC(4, 2) NOT NULL,
    review_count  INT          NOT NULL DEFAULT 0,
    badge         VARCHAR(32)
);

CREATE INDEX idx_restaurants_city ON restaurants (city_id);

CREATE TABLE restaurant_cuisines (
    restaurant_id BIGINT NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
    cuisine_id      BIGINT NOT NULL REFERENCES cuisines (id),
    PRIMARY KEY (restaurant_id, cuisine_id)
);

CREATE TABLE experiences (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    category_id     BIGINT       NOT NULL REFERENCES categories (id),
    city_id         BIGINT       NOT NULL REFERENCES cities (id),
    image_url       VARCHAR(1024) NOT NULL,
    duration_hours  NUMERIC(6, 2) NOT NULL,
    price_from      NUMERIC(19, 4) NOT NULL,
    currency        CHAR(3)      NOT NULL,
    rating          NUMERIC(4, 2) NOT NULL,
    badge           VARCHAR(32)
);

CREATE INDEX idx_experiences_city ON experiences (city_id);
CREATE INDEX idx_experiences_category ON experiences (category_id);

CREATE TABLE hotels (
    id            BIGSERIAL PRIMARY KEY,
    name          VARCHAR(300) NOT NULL,
    city_id       BIGINT       NOT NULL REFERENCES cities (id),
    image_url     VARCHAR(1024) NOT NULL,
    stars         SMALLINT     NOT NULL,
    price_from    NUMERIC(19, 4) NOT NULL,
    currency      CHAR(3)      NOT NULL,
    rating        NUMERIC(4, 2) NOT NULL,
    badge         VARCHAR(32)
);

CREATE INDEX idx_hotels_city ON hotels (city_id);

CREATE TABLE flights (
    id           BIGSERIAL PRIMARY KEY,
    airline      VARCHAR(200) NOT NULL,
    from_code    VARCHAR(8)   NOT NULL,
    to_code      VARCHAR(8)   NOT NULL,
    depart_at    TIMESTAMPTZ  NOT NULL,
    arrive_at    TIMESTAMPTZ  NOT NULL,
    duration_min INT          NOT NULL,
    stops        INT          NOT NULL DEFAULT 0,
    price        NUMERIC(19, 4) NOT NULL,
    currency     CHAR(3)      NOT NULL,
    cabin        VARCHAR(16)  NOT NULL
);

CREATE INDEX idx_flights_depart ON flights (depart_at);
CREATE INDEX idx_flights_route ON flights (from_code, to_code);

CREATE TABLE packages (
    id          BIGSERIAL PRIMARY KEY,
    title       VARCHAR(500) NOT NULL,
    image_url   VARCHAR(1024) NOT NULL,
    nights      INT          NOT NULL,
    price_from  NUMERIC(19, 4) NOT NULL,
    currency    CHAR(3)      NOT NULL,
    badge       VARCHAR(32)
);

CREATE TABLE package_cities (
    package_id BIGINT NOT NULL REFERENCES packages (id) ON DELETE CASCADE,
    city_id    BIGINT NOT NULL REFERENCES cities (id),
    PRIMARY KEY (package_id, city_id)
);

CREATE INDEX idx_package_cities_city ON package_cities (city_id);

CREATE TABLE offers (
    id                BIGSERIAL PRIMARY KEY,
    title             VARCHAR(300) NOT NULL,
    subtitle          VARCHAR(500) NOT NULL,
    image_url         VARCHAR(1024) NOT NULL,
    discount_percent  INT,
    ends_at           TIMESTAMPTZ NOT NULL,
    target_type       VARCHAR(32),
    target_id         BIGINT
);

CREATE INDEX idx_offers_ends_at ON offers (ends_at);

-- --- Seed (FKs via subqueries on slug / name) ---
INSERT INTO organizers (name, logo_url, cover_url, verified, about, rating, review_count)
VALUES
    ('Nebula Live',
     'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=200&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&q=80&auto=format&fit=crop',
     TRUE,
     'Regional promoter for immersive concerts and cultural festivals.',
     4.90, 12840),
    ('Atlas Dining Group',
     'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&q=80&auto=format&fit=crop',
     'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80&auto=format&fit=crop',
     TRUE,
     'Chef-led tables across GCC capitals.',
     4.80, 6200);

INSERT INTO events (title, category_id, city_id, organizer_id, image_url, gallery, start_at, end_at,
                    venue_name, address, description, price_from, currency, rating, review_count, badge)
VALUES
    ('Aurora Sound Festival',
     (SELECT id FROM categories WHERE slug = 'events'),
     (SELECT id FROM cities WHERE name_en = 'Riyadh'),
     (SELECT id FROM organizers WHERE name = 'Nebula Live'),
     'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800&q=85&auto=format&fit=crop',
     '[]'::jsonb,
     '2026-07-18T19:00:00+03:00', '2026-07-18T23:30:00+03:00',
     'Boulevard Arena', 'King Salman Rd, Riyadh',
     'A multi-stage night with regional headliners and immersive visuals.',
     180, 'SAR', 4.90, 842, 'popular'),
    ('Jazz Under the Stars',
     (SELECT id FROM categories WHERE slug = 'events'),
     (SELECT id FROM cities WHERE name_en = 'Jeddah'),
     (SELECT id FROM organizers WHERE name = 'Nebula Live'),
     'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=85&auto=format&fit=crop',
     '[]'::jsonb,
     '2026-06-28T20:00:00+03:00', '2026-06-28T22:30:00+03:00',
     'Red Sea Stage', 'Corniche, Jeddah',
     'Acoustic sets and curated vinyl listening sessions.',
     95, 'SAR', 4.70, 312, 'new'),
    ('Champions League Fanzone',
     (SELECT id FROM categories WHERE slug = 'sports'),
     (SELECT id FROM cities WHERE name_en = 'Dubai'),
     (SELECT id FROM organizers WHERE name = 'Nebula Live'),
     'https://images.unsplash.com/photo-1522778119023-d35f7926bbc0?w=800&q=85&auto=format&fit=crop',
     '[]'::jsonb,
     '2026-06-10T16:00:00+04:00', '2026-06-10T23:00:00+04:00',
     'Dubai Marina', 'Dubai',
     'Giant screens, live DJs, and guest appearances.',
     0, 'AED', 4.60, 1205, 'soldFast');

INSERT INTO ticket_tiers (event_id, name, price, currency, remaining)
SELECT e.id, v.name, v.price, v.currency, v.remaining
FROM events e
         CROSS JOIN (VALUES
                         ('Standard', 180::numeric, 'SAR', 420),
                         ('Premium', 350::numeric, 'SAR', 90),
                         ('VIP', 720::numeric, 'SAR', 24),
                         ('Family', 520::numeric, 'SAR', 55)
                    ) AS v(name, price, currency, remaining)
WHERE e.title = 'Aurora Sound Festival';

INSERT INTO ticket_tier_benefits (tier_id, sort_index, benefit)
SELECT t.id, b.idx, b.line
FROM ticket_tiers t
         JOIN events e ON t.event_id = e.id
         CROSS JOIN LATERAL (VALUES
                                 (0, 'General admission'),
                                 (1, 'Digital pass')
                            ) AS b(idx, line)
WHERE e.title = 'Aurora Sound Festival'
  AND t.name = 'Standard';

INSERT INTO ticket_tier_benefits (tier_id, sort_index, benefit)
SELECT t.id, b.idx, b.line
FROM ticket_tiers t
         JOIN events e ON t.event_id = e.id
         CROSS JOIN LATERAL (VALUES
                                 (0, 'Closer seating'),
                                 (1, 'Lounge access pre-show')
                            ) AS b(idx, line)
WHERE e.title = 'Aurora Sound Festival'
  AND t.name = 'Premium';

INSERT INTO ticket_tier_benefits (tier_id, sort_index, benefit)
SELECT t.id, b.idx, b.line
FROM ticket_tiers t
         JOIN events e ON t.event_id = e.id
         CROSS JOIN LATERAL (VALUES
                                 (0, 'Backstage meet'),
                                 (1, 'Premium parking'),
                                 (2, 'Complimentary drinks')
                            ) AS b(idx, line)
WHERE e.title = 'Aurora Sound Festival'
  AND t.name = 'VIP';

INSERT INTO ticket_tier_benefits (tier_id, sort_index, benefit)
SELECT t.id, b.idx, b.line
FROM ticket_tiers t
         JOIN events e ON t.event_id = e.id
         CROSS JOIN LATERAL (VALUES
                                 (0, '4 seats'),
                                 (1, 'Kid-friendly zone')
                            ) AS b(idx, line)
WHERE e.title = 'Aurora Sound Festival'
  AND t.name = 'Family';

INSERT INTO restaurants (name, city_id, image_url, price_level, rating, review_count, badge)
VALUES
    ('Maison Noor',
     (SELECT id FROM cities WHERE name_en = 'Riyadh'),
     'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=800&q=85&auto=format&fit=crop',
     4, 4.90, 2100, 'popular'),
    ('Harbor Raw Bar',
     (SELECT id FROM cities WHERE name_en = 'Jeddah'),
     'https://images.unsplash.com/photo-1555396273-367ea4eb4db1?w=800&q=85&auto=format&fit=crop',
     3, 4.70, 980, 'new');

INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
SELECT r.id, c.id
FROM restaurants r
         CROSS JOIN cuisines c
WHERE r.name = 'Maison Noor'
  AND c.slug = 'middle_eastern';

INSERT INTO restaurant_cuisines (restaurant_id, cuisine_id)
SELECT r.id, c.id
FROM restaurants r
         CROSS JOIN cuisines c
WHERE r.name = 'Harbor Raw Bar'
  AND c.slug = 'seafood';

INSERT INTO experiences (title, category_id, city_id, image_url, duration_hours, price_from, currency, rating, badge)
VALUES
    ('Desert stargazing & astronomy',
     (SELECT id FROM categories WHERE slug = 'travel'),
     (SELECT id FROM cities WHERE name_en = 'Dubai'),
     'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=85&auto=format&fit=crop',
     5, 420, 'AED', 4.95, 'exclusive'),
    ('Private yacht sunset cruise',
     (SELECT id FROM categories WHERE slug = 'travel'),
     (SELECT id FROM cities WHERE name_en = 'Jeddah'),
     'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=85&auto=format&fit=crop',
     3, 890, 'SAR', 4.80, 'limited');

INSERT INTO hotels (name, city_id, image_url, stars, price_from, currency, rating, badge)
VALUES
    ('Velvet Sky Hotel',
     (SELECT id FROM cities WHERE name_en = 'Dubai'),
     'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=85&auto=format&fit=crop',
     5, 890, 'AED', 4.85, 'popular'),
    ('Oasis Boutique',
     (SELECT id FROM cities WHERE name_en = 'Riyadh'),
     'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=85&auto=format&fit=crop',
     4, 520, 'SAR', 4.60, NULL);

INSERT INTO flights (airline, from_code, to_code, depart_at, arrive_at, duration_min, stops, price, currency, cabin)
VALUES
    ('Gulf Wings', 'RUH', 'DXB',
     '2026-08-12T08:15:00+03:00', '2026-08-12T10:45:00+04:00',
     90, 0, 420, 'SAR', 'economy'),
    ('Red Sea Air', 'JED', 'DOH',
     '2026-08-15T14:20:00+03:00', '2026-08-15T17:05:00+03:00',
     165, 1, 680, 'SAR', 'business');

INSERT INTO packages (title, image_url, nights, price_from, currency, badge)
VALUES
    ('Maldives 5★ — 4 nights',
     'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&q=85&auto=format&fit=crop',
     4, 6890, 'USD', 'limited'),
    ('AlUla heritage escape',
     'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=85&auto=format&fit=crop',
     3, 2100, 'SAR', 'exclusive');

INSERT INTO package_cities (package_id, city_id)
SELECT p.id, c.id
FROM packages p
         CROSS JOIN cities c
WHERE p.title = 'Maldives 5★ — 4 nights'
  AND c.name_en = 'Dubai';

INSERT INTO package_cities (package_id, city_id)
SELECT p.id, c.id
FROM packages p
         CROSS JOIN cities c
WHERE p.title = 'AlUla heritage escape'
  AND c.name_en = 'Riyadh';

INSERT INTO offers (title, subtitle, image_url, discount_percent, ends_at, target_type, target_id)
VALUES
    ('Weekend dining — 20% off',
     'Selected tables in Riyadh & Jeddah',
     'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=85&auto=format&fit=crop',
     20, '2026-04-15T23:59:59+03:00', NULL, NULL),
    ('Early bird flights',
     'Book 21+ days ahead',
     'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=85&auto=format&fit=crop',
     15, '2026-05-01T23:59:59+03:00', NULL, NULL);
