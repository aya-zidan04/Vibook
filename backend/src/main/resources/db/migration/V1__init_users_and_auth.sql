-- Core roles for RBAC (USER assigned on registration; BUSINESS / ADMIN via ops later)
CREATE TABLE roles (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(32) NOT NULL UNIQUE
);

INSERT INTO roles (name) VALUES ('USER');
INSERT INTO roles (name) VALUES ('BUSINESS');
INSERT INTO roles (name) VALUES ('ADMIN');

-- App user: maps to mobile profile (first/last from signup; fullName derived in API responses)
CREATE TABLE users (
    id                  UUID PRIMARY KEY,
    email               VARCHAR(255) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100) NOT NULL,
    phone               VARCHAR(32)  NOT NULL,
    name_ar             VARCHAR(200),
    preferred_language  VARCHAR(16)  NOT NULL DEFAULT 'EN',
    avatar_url          VARCHAR(1024),
    membership_tier     VARCHAR(32)  NOT NULL DEFAULT 'STANDARD',
    wallet_balance      NUMERIC(19, 4) NOT NULL DEFAULT 0,
    wallet_currency     CHAR(3)      NOT NULL DEFAULT 'SAR',
    city_id             BIGINT,
    enabled             BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users (email);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    role_id BIGINT NOT NULL REFERENCES roles (id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

-- Opaque refresh tokens stored as SHA-256 hex (64 chars); raw token only sent to client once
CREATE TABLE refresh_tokens (
    id          BIGSERIAL PRIMARY KEY,
    user_id     UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMPTZ NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens (user_id);
