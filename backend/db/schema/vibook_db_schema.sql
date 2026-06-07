-- =============================================================================
-- Vibook Database Schema — MySQL 8
-- Database: vibook_db
-- Generated from live database (verified 2026-06-08)
-- Collation matches live MySQL 8 default: utf8mb4_0900_ai_ci
-- Tables: 19
-- =============================================================================
-- Usage:
--   mysql -u root -p < vibook_db_schema.sql
-- Or open in MySQL Workbench → File → Run SQL Script
-- =============================================================================

CREATE DATABASE IF NOT EXISTS vibook_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE vibook_db;

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- -----------------------------------------------------------------------------
-- AUTH & USERS
-- -----------------------------------------------------------------------------

CREATE TABLE users (
  id                BIGINT       NOT NULL AUTO_INCREMENT,
  first_name        VARCHAR(80)  NOT NULL,
  last_name         VARCHAR(80)  NOT NULL,
  email             VARCHAR(120) NOT NULL,
  password          VARCHAR(255) NOT NULL,
  phone             VARCHAR(20)  NOT NULL,
  profile_image_url VARCHAR(512) NULL,
  enabled           BIT(1)       NOT NULL,
  created_at        DATETIME(6)  NOT NULL,
  updated_at        DATETIME(6)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE roles (
  id   BIGINT NOT NULL AUTO_INCREMENT,
  name ENUM('ROLE_ADMIN','ROLE_BUSINESS','ROLE_USER') NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  KEY idx_user_roles_role_id (role_id),
  CONSTRAINT fk_user_roles_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_user_roles_role FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE refresh_tokens (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  user_id     BIGINT       NOT NULL,
  token       VARCHAR(255) NOT NULL,
  expiry_date DATETIME(6)  NOT NULL,
  revoked     BIT(1)       NOT NULL,
  created_at  DATETIME(6)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_refresh_tokens_token (token),
  KEY idx_refresh_tokens_user_id (user_id),
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- REFERENCE DATA
-- -----------------------------------------------------------------------------

CREATE TABLE governorates (
  id            BIGINT       NOT NULL AUTO_INCREMENT,
  name          VARCHAR(120) NOT NULL,
  display_order INT          NOT NULL,
  active        BIT(1)       NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_governorates_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE categories (
  id     BIGINT       NOT NULL AUTO_INCREMENT,
  name   VARCHAR(120) NOT NULL,
  slug   VARCHAR(80)  NOT NULL,
  icon   VARCHAR(64)  NULL,
  active BIT(1)       NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE subcategories (
  id          BIGINT       NOT NULL AUTO_INCREMENT,
  category_id BIGINT       NOT NULL,
  name        VARCHAR(120) NOT NULL,
  slug        VARCHAR(80)  NOT NULL,
  active      BIT(1)       NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_subcategory_category_slug (category_id, slug),
  CONSTRAINT fk_subcategories_category FOREIGN KEY (category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- BUSINESS
-- -----------------------------------------------------------------------------

CREATE TABLE business_profiles (
  id                    BIGINT       NOT NULL AUTO_INCREMENT,
  user_id               BIGINT       NOT NULL,
  governorate_id        BIGINT       NOT NULL,
  primary_category_id   BIGINT       NOT NULL,
  business_name         VARCHAR(150) NOT NULL,
  tagline               VARCHAR(255) NULL,
  description           VARCHAR(800) NULL,
  work_email            VARCHAR(120) NULL,
  phone                 VARCHAR(30)  NULL,
  website               VARCHAR(512) NULL,
  google_maps_url       VARCHAR(512) NULL,
  logo_image_url        VARCHAR(512) NULL,
  banner_image_url      VARCHAR(512) NULL,
  status                ENUM('APPROVED','DRAFT','PENDING_REVIEW','REJECTED') NOT NULL,
  rejection_reason      VARCHAR(500) NULL,
  admin_notes           TEXT         NULL,
  approved_at           DATETIME(6)  NULL,
  rejected_at           DATETIME(6)  NULL,
  requires_re_approval  BIT(1)       NOT NULL,
  previously_approved   BIT(1)       NOT NULL,
  created_at            DATETIME(6)  NOT NULL,
  updated_at            DATETIME(6)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_business_profiles_user_id (user_id),
  KEY idx_business_profiles_governorate_id (governorate_id),
  KEY idx_business_profiles_primary_category_id (primary_category_id),
  CONSTRAINT fk_business_profiles_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_business_profiles_governorate FOREIGN KEY (governorate_id) REFERENCES governorates (id),
  CONSTRAINT fk_business_profiles_category FOREIGN KEY (primary_category_id) REFERENCES categories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE business_events (
  id                  BIGINT        NOT NULL AUTO_INCREMENT,
  business_profile_id BIGINT        NOT NULL,
  subcategory_id      BIGINT        NOT NULL,
  governorate_id      BIGINT        NOT NULL,
  title               VARCHAR(255)  NULL,
  description         VARCHAR(4000) NOT NULL,
  event_date          DATE          NOT NULL,
  price_jod           DECIMAL(12,2) NOT NULL,
  currency            VARCHAR(8)    NOT NULL,
  capacity_guests     INT           NOT NULL,
  hidden              BIT(1)        NOT NULL,
  average_rating      DOUBLE        NOT NULL,
  review_count        INT           NOT NULL,
  google_maps_url     VARCHAR(512)  NULL,
  admin_notes         VARCHAR(2000) NULL,
  created_at          DATETIME(6)   NOT NULL,
  updated_at          DATETIME(6)   NOT NULL,
  PRIMARY KEY (id),
  KEY idx_business_events_profile_id (business_profile_id),
  KEY idx_business_events_governorate_id (governorate_id),
  KEY idx_business_events_subcategory_id (subcategory_id),
  CONSTRAINT fk_business_events_profile FOREIGN KEY (business_profile_id) REFERENCES business_profiles (id),
  CONSTRAINT fk_business_events_governorate FOREIGN KEY (governorate_id) REFERENCES governorates (id),
  CONSTRAINT fk_business_events_subcategory FOREIGN KEY (subcategory_id) REFERENCES subcategories (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE business_event_time_slots (
  id                BIGINT      NOT NULL AUTO_INCREMENT,
  business_event_id BIGINT      NOT NULL,
  slot_label        VARCHAR(32) NOT NULL,
  sort_order        INT         NOT NULL,
  PRIMARY KEY (id),
  KEY idx_time_slots_event_id (business_event_id),
  CONSTRAINT fk_time_slots_event FOREIGN KEY (business_event_id) REFERENCES business_events (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE business_event_photos (
  id                BIGINT        NOT NULL AUTO_INCREMENT,
  business_event_id BIGINT        NOT NULL,
  image_url         VARCHAR(1024) NOT NULL,
  sort_order        INT           NOT NULL,
  PRIMARY KEY (id),
  KEY idx_event_photos_event_id (business_event_id),
  CONSTRAINT fk_event_photos_event FOREIGN KEY (business_event_id) REFERENCES business_events (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- CONSUMER
-- -----------------------------------------------------------------------------

CREATE TABLE bookings (
  id              BIGINT        NOT NULL AUTO_INCREMENT,
  user_id         BIGINT        NOT NULL,
  event_id        BIGINT        NOT NULL,
  time_slot_id    BIGINT        NULL,
  guests_count    INT           NOT NULL,
  total_price_jod DECIMAL(14,2) NOT NULL,
  status          ENUM('CANCELLED','COMPLETED','CONFIRMED','PENDING') NOT NULL,
  note            VARCHAR(500)  NULL,
  cancel_reason   VARCHAR(500)  NULL,
  created_at      DATETIME(6)   NOT NULL,
  updated_at      DATETIME(6)   NOT NULL,
  PRIMARY KEY (id),
  KEY idx_bookings_user_id (user_id),
  KEY idx_bookings_event_id (event_id),
  KEY idx_bookings_time_slot_id (time_slot_id),
  CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_bookings_event FOREIGN KEY (event_id) REFERENCES business_events (id),
  CONSTRAINT fk_bookings_time_slot FOREIGN KEY (time_slot_id) REFERENCES business_event_time_slots (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE event_favorites (
  id         BIGINT      NOT NULL AUTO_INCREMENT,
  user_id    BIGINT      NOT NULL,
  event_id   BIGINT      NOT NULL,
  created_at DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_favorite_user_event (user_id, event_id),
  KEY idx_favorites_event_id (event_id),
  CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_favorites_event FOREIGN KEY (event_id) REFERENCES business_events (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE event_ratings (
  id                BIGINT      NOT NULL AUTO_INCREMENT,
  user_id           BIGINT      NOT NULL,
  event_id          BIGINT      NOT NULL,
  rating_value      INT         NOT NULL,
  flagged           BIT(1)      NOT NULL,
  moderation_hidden BIT(1)      NOT NULL,
  created_at        DATETIME(6) NOT NULL,
  updated_at        DATETIME(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_event_rating_user_event (user_id, event_id),
  KEY idx_ratings_event_id (event_id),
  CONSTRAINT fk_ratings_user FOREIGN KEY (user_id) REFERENCES users (id),
  CONSTRAINT fk_ratings_event FOREIGN KEY (event_id) REFERENCES business_events (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE payment_methods (
  id               BIGINT       NOT NULL AUTO_INCREMENT,
  user_id          BIGINT       NOT NULL,
  brand            VARCHAR(32)  NOT NULL,
  card_last4       VARCHAR(4)   NOT NULL,
  expiry_month     INT          NOT NULL,
  expiry_year      INT          NOT NULL,
  card_holder_name VARCHAR(120) NOT NULL,
  is_default       BIT(1)       NOT NULL,
  created_at       DATETIME(6)  NOT NULL,
  updated_at       DATETIME(6)  NOT NULL,
  PRIMARY KEY (id),
  KEY idx_payment_methods_user_id (user_id),
  CONSTRAINT fk_payment_methods_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE payments (
  id                BIGINT        NOT NULL AUTO_INCREMENT,
  booking_id        BIGINT        NOT NULL,
  provider          ENUM('PAYPAL') NOT NULL,
  status            ENUM('APPROVED','CANCELLED','CAPTURED','CREATED','FAILED') NOT NULL,
  paypal_order_id   VARCHAR(64)   NULL,
  paypal_capture_id VARCHAR(64)   NULL,
  amount            DECIMAL(14,2) NOT NULL,
  currency          VARCHAR(8)    NOT NULL,
  response_summary  VARCHAR(2000) NULL,
  created_at        DATETIME(6)   NOT NULL,
  updated_at        DATETIME(6)   NOT NULL,
  PRIMARY KEY (id),
  KEY idx_payments_booking_id (booking_id),
  CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- -----------------------------------------------------------------------------
-- ADMIN & MODERATION
-- -----------------------------------------------------------------------------

CREATE TABLE moderation_reports (
  id               BIGINT        NOT NULL AUTO_INCREMENT,
  reporter_user_id BIGINT        NOT NULL,
  type             ENUM('BOOKING','BUSINESS_PROFILE','EVENT','OTHER','RATING','USER') NOT NULL,
  target_id        BIGINT        NULL,
  reason           VARCHAR(2000) NOT NULL,
  description      VARCHAR(4000) NULL,
  status           ENUM('DISMISSED','OPEN','RESOLVED','REVIEWED') NOT NULL,
  admin_notes      VARCHAR(2000) NULL,
  created_at       DATETIME(6)   NOT NULL,
  updated_at       DATETIME(6)   NULL,
  resolved_at      DATETIME(6)   NULL,
  PRIMARY KEY (id),
  KEY idx_moderation_reports_reporter (reporter_user_id),
  CONSTRAINT fk_moderation_reports_reporter FOREIGN KEY (reporter_user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE user_reports (
  id         BIGINT        NOT NULL AUTO_INCREMENT,
  user_id    BIGINT        NOT NULL,
  subject    VARCHAR(200)  NOT NULL,
  message    VARCHAR(4000) NOT NULL,
  status     ENUM('IN_PROGRESS','OPEN','RESOLVED') NOT NULL,
  created_at DATETIME(6)   NOT NULL,
  updated_at DATETIME(6)   NULL,
  PRIMARY KEY (id),
  KEY idx_user_reports_user_id (user_id),
  CONSTRAINT fk_user_reports_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE admin_activity_logs (
  id            BIGINT        NOT NULL AUTO_INCREMENT,
  admin_user_id BIGINT        NOT NULL,
  admin_email   VARCHAR(120)  NOT NULL,
  action        ENUM(
    'APPROVE_BUSINESS_PROFILE','BULK_APPROVE_BUSINESS_PROFILES','BULK_REJECT_BUSINESS_PROFILES',
    'CREATE_CATEGORY','DELETE_CATEGORY','DISABLE_USER','ENABLE_USER','REJECT_BUSINESS_PROFILE',
    'UPDATE_BUSINESS_NOTES','UPDATE_CATEGORY','UPDATE_GOVERNORATE_STATUS','UPDATE_USER_ROLES'
  ) NOT NULL,
  entity_type   VARCHAR(40)   NOT NULL,
  entity_id     BIGINT        NOT NULL,
  details       VARCHAR(2000) NULL,
  created_at    DATETIME(6)   NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

SET FOREIGN_KEY_CHECKS = 1;
