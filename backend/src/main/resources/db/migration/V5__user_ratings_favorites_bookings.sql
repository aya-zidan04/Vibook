-- Private user listing ratings (1–5). Catalog aggregate `rating` columns stay separate.
CREATE TABLE user_listing_ratings (
    user_id    UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    vertical   VARCHAR(32)  NOT NULL,
    ref_id     BIGINT       NOT NULL,
    stars      SMALLINT     NOT NULL CHECK (stars >= 1 AND stars <= 5),
    updated_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, vertical, ref_id)
);

CREATE INDEX idx_user_listing_ratings_user ON user_listing_ratings (user_id);

-- Saved items per user (type + catalog ref). Lightweight rows; mobile can hydrate via catalog APIs.
CREATE TABLE user_favorites (
    user_id    UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    item_type  VARCHAR(32)  NOT NULL,
    ref_id     BIGINT       NOT NULL,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, item_type, ref_id)
);

CREATE INDEX idx_user_favorites_user ON user_favorites (user_id);

-- User bookings: denormalized display fields + payment hook for future PSP integration.
CREATE TABLE bookings (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id            UUID            NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    booking_type       VARCHAR(32)     NOT NULL,
    ref_id             BIGINT          NOT NULL,
    ref_title          VARCHAR(500)    NOT NULL,
    ref_title_ar       VARCHAR(500),
    image_url          VARCHAR(1024)   NOT NULL,
    status             VARCHAR(32)     NOT NULL,
    starts_at          TIMESTAMPTZ     NOT NULL,
    city_name          VARCHAR(200)    NOT NULL,
    city_name_ar       VARCHAR(200),
    total_paid         NUMERIC(19, 4)  NOT NULL DEFAULT 0,
    currency           CHAR(3)         NOT NULL,
    quantity           INT             NOT NULL DEFAULT 1 CHECK (quantity >= 1),
    unit_price         NUMERIC(19, 4),
    fees               NUMERIC(19, 4)  NOT NULL DEFAULT 0,
    payment_reference  VARCHAR(255),
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ     NOT NULL DEFAULT now()
);

CREATE INDEX idx_bookings_user_starts ON bookings (user_id, starts_at DESC);
