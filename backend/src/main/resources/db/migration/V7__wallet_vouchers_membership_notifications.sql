-- Membership plans (reference data; seeded here, editable later via admin in a future phase)
CREATE TABLE membership_plans (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(64)  NOT NULL UNIQUE,
    tier            VARCHAR(32)  NOT NULL,
    name_en         VARCHAR(200) NOT NULL,
    name_ar         VARCHAR(200),
    price_monthly   NUMERIC(19, 4) NOT NULL DEFAULT 0,
    currency        CHAR(3)      NOT NULL,
    recommended     BOOLEAN      NOT NULL DEFAULT FALSE,
    benefits        JSONB        NOT NULL DEFAULT '[]'::jsonb,
    active          BOOLEAN      NOT NULL DEFAULT TRUE,
    sort_index      INT          NOT NULL DEFAULT 0
);

ALTER TABLE membership_plans
    ADD CONSTRAINT chk_membership_plans_currency CHECK (currency IN ('JOD', 'USD'));

INSERT INTO membership_plans (code, tier, name_en, name_ar, price_monthly, currency, recommended, benefits, sort_index)
VALUES
    ('STANDARD', 'STANDARD', 'Standard', 'الأساسية', 0, 'JOD', FALSE, '["core_booking","email_support"]'::jsonb, 0),
    ('GOLD', 'GOLD', 'Gold', 'الذهبي', 29.9900, 'JOD', TRUE, '["priority_support","extra_cashback","early_access"]'::jsonb, 1),
    ('PLATINUM', 'PLATINUM', 'Platinum', 'البلاتيني', 59.9900, 'JOD', FALSE, '["concierge","lounge","max_cashback"]'::jsonb, 2);

ALTER TABLE users
    ADD COLUMN membership_plan_id BIGINT REFERENCES membership_plans (id),
    ADD COLUMN membership_subscribed_at TIMESTAMPTZ,
    ADD COLUMN membership_renews_at TIMESTAMPTZ,
    ADD COLUMN membership_subscription_status VARCHAR(32) NOT NULL DEFAULT 'NONE',
    ADD COLUMN membership_payment_reference VARCHAR(255);

ALTER TABLE users
    ADD CONSTRAINT chk_users_membership_subscription_status
        CHECK (membership_subscription_status IN ('NONE', 'ACTIVE', 'CANCELLED'));

-- Voucher campaigns (redeemable codes)
CREATE TABLE voucher_campaigns (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(64)  NOT NULL UNIQUE,
    title           VARCHAR(300) NOT NULL,
    title_ar        VARCHAR(300),
    discount_type   VARCHAR(16)  NOT NULL,
    discount_value  NUMERIC(19, 4) NOT NULL,
    expires_at      TIMESTAMPTZ  NOT NULL,
    active          BOOLEAN      NOT NULL DEFAULT TRUE
);

INSERT INTO voucher_campaigns (code, title, title_ar, discount_type, discount_value, expires_at)
VALUES
    ('WELCOME10', 'Welcome 10% off', 'خصم ترحيبي 10%', 'PERCENT', 10, '2030-12-31T23:59:59Z'),
    ('SAVE5JOD', '5 JOD off', 'خصم 5 دنانير', 'FIXED', 5, '2030-12-31T23:59:59Z');

-- User-claimed vouchers (one row per user per campaign)
CREATE TABLE user_vouchers (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id      UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    campaign_id  BIGINT       NOT NULL REFERENCES voucher_campaigns (id) ON DELETE CASCADE,
    claimed_at   TIMESTAMPTZ  NOT NULL DEFAULT now(),
    applied_at   TIMESTAMPTZ,
    UNIQUE (user_id, campaign_id)
);

CREATE INDEX idx_user_vouchers_user ON user_vouchers (user_id);

-- In-app notifications
CREATE TABLE user_notifications (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid (),
    user_id    UUID         NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    kind       VARCHAR(32)  NOT NULL,
    title      VARCHAR(300) NOT NULL,
    body       TEXT         NOT NULL,
    read       BOOLEAN      NOT NULL DEFAULT FALSE,
    payload    JSONB,
    created_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_notifications_user_created ON user_notifications (user_id, created_at DESC);

ALTER TABLE user_notifications
    ADD CONSTRAINT chk_user_notifications_kind
        CHECK (kind IN ('booking', 'promo', 'reminder', 'price', 'wishlist'));

ALTER TABLE voucher_campaigns
    ADD CONSTRAINT chk_voucher_campaigns_discount_type CHECK (discount_type IN ('PERCENT', 'FIXED'));
