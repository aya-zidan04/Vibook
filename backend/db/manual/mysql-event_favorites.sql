-- Run manually only if `event_favorites` is missing and you do not use Hibernate ddl-auto: update.
-- Matches com.vibook.backend.entity.Favorite (table event_favorites).

CREATE TABLE IF NOT EXISTS event_favorites (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    created_at DATETIME(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_favorite_user_event UNIQUE (user_id, event_id),
    CONSTRAINT fk_event_favorites_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_event_favorites_event FOREIGN KEY (event_id) REFERENCES business_events (id),
    KEY idx_event_favorites_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
