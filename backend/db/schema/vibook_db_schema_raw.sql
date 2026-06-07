-- MySQL dump 10.13  Distrib 8.0.45, for macos15 (arm64)
--
-- Host: localhost    Database: vibook_db
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_activity_logs`
--

DROP TABLE IF EXISTS `admin_activity_logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_activity_logs` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `action` enum('APPROVE_BUSINESS_PROFILE','BULK_APPROVE_BUSINESS_PROFILES','BULK_REJECT_BUSINESS_PROFILES','CREATE_CATEGORY','DELETE_CATEGORY','DISABLE_USER','ENABLE_USER','REJECT_BUSINESS_PROFILE','UPDATE_BUSINESS_NOTES','UPDATE_CATEGORY','UPDATE_GOVERNORATE_STATUS','UPDATE_USER_ROLES') NOT NULL,
  `admin_email` varchar(120) NOT NULL,
  `admin_user_id` bigint NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `details` varchar(2000) DEFAULT NULL,
  `entity_id` bigint NOT NULL,
  `entity_type` varchar(40) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bookings`
--

DROP TABLE IF EXISTS `bookings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bookings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `status` enum('CANCELLED','COMPLETED','CONFIRMED','PENDING') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `cancel_reason` varchar(500) DEFAULT NULL,
  `guests_count` int NOT NULL,
  `note` varchar(500) DEFAULT NULL,
  `total_price_jod` decimal(14,2) NOT NULL,
  `time_slot_id` bigint DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKrf0wqa6fifcls6csfp9shv6fy` (`event_id`),
  KEY `FKeyog2oic85xg7hsu2je2lx3s6` (`user_id`),
  KEY `FKphbd2cscbyyl7jhuk6bto7isb` (`time_slot_id`),
  CONSTRAINT `FKeyog2oic85xg7hsu2je2lx3s6` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKphbd2cscbyyl7jhuk6bto7isb` FOREIGN KEY (`time_slot_id`) REFERENCES `business_event_time_slots` (`id`),
  CONSTRAINT `FKrf0wqa6fifcls6csfp9shv6fy` FOREIGN KEY (`event_id`) REFERENCES `business_events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `business_event_photos`
--

DROP TABLE IF EXISTS `business_event_photos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_event_photos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `image_url` varchar(1024) NOT NULL,
  `sort_order` int NOT NULL,
  `business_event_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKp3vcwpal742t3kks85d09ro4k` (`business_event_id`),
  CONSTRAINT `FKp3vcwpal742t3kks85d09ro4k` FOREIGN KEY (`business_event_id`) REFERENCES `business_events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=57 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `business_event_time_slots`
--

DROP TABLE IF EXISTS `business_event_time_slots`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_event_time_slots` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `slot_label` varchar(32) NOT NULL,
  `sort_order` int NOT NULL,
  `business_event_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK1rqfmdyrdjxqbet43my4dhby0` (`business_event_id`),
  CONSTRAINT `FK1rqfmdyrdjxqbet43my4dhby0` FOREIGN KEY (`business_event_id`) REFERENCES `business_events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=40 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `business_events`
--

DROP TABLE IF EXISTS `business_events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_events` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `capacity_guests` int NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `currency` varchar(8) NOT NULL,
  `description` varchar(4000) NOT NULL,
  `event_date` date NOT NULL,
  `google_maps_url` varchar(512) DEFAULT NULL,
  `hidden` bit(1) NOT NULL,
  `price_jod` decimal(12,2) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `business_profile_id` bigint NOT NULL,
  `governorate_id` bigint NOT NULL,
  `subcategory_id` bigint NOT NULL,
  `average_rating` double NOT NULL,
  `review_count` int NOT NULL,
  `admin_notes` varchar(2000) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK57ecggj6jkjkjmufnyqd5pfii` (`business_profile_id`),
  KEY `FK6hxu6q87rkp10m1bq9jca4wss` (`governorate_id`),
  KEY `FKfx2ywnv4ay0rbdqg893qt13ts` (`subcategory_id`),
  CONSTRAINT `FK57ecggj6jkjkjmufnyqd5pfii` FOREIGN KEY (`business_profile_id`) REFERENCES `business_profiles` (`id`),
  CONSTRAINT `FK6hxu6q87rkp10m1bq9jca4wss` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`),
  CONSTRAINT `FKfx2ywnv4ay0rbdqg893qt13ts` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `business_profiles`
--

DROP TABLE IF EXISTS `business_profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `business_profiles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `banner_image_url` varchar(512) DEFAULT NULL,
  `business_name` varchar(150) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(800) DEFAULT NULL,
  `google_maps_url` varchar(512) DEFAULT NULL,
  `logo_image_url` varchar(512) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `status` enum('APPROVED','DRAFT','PENDING_REVIEW','REJECTED') NOT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `website` varchar(512) DEFAULT NULL,
  `work_email` varchar(120) DEFAULT NULL,
  `governorate_id` bigint NOT NULL,
  `primary_category_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `rejection_reason` varchar(500) DEFAULT NULL,
  `admin_notes` text,
  `approved_at` datetime(6) DEFAULT NULL,
  `rejected_at` datetime(6) DEFAULT NULL,
  `previously_approved` bit(1) NOT NULL,
  `requires_re_approval` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKfbfb8fvcm18wgvn1g4vtygy0n` (`user_id`),
  KEY `FK3gywgq1fu88d1v2nspvxxu062` (`governorate_id`),
  KEY `FKqxk3jxcx94wba0km1jbmebdl` (`primary_category_id`),
  CONSTRAINT `FK3gywgq1fu88d1v2nspvxxu062` FOREIGN KEY (`governorate_id`) REFERENCES `governorates` (`id`),
  CONSTRAINT `FK6rtkyif43obkivqccykb4id3p` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKqxk3jxcx94wba0km1jbmebdl` FOREIGN KEY (`primary_category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `icon` varchar(64) DEFAULT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(80) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKoul14ho7bctbefv8jywp5v3i2` (`slug`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_favorites`
--

DROP TABLE IF EXISTS `event_favorites`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_favorites` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_favorite_user_event` (`user_id`,`event_id`),
  KEY `FKh4iky74ohuig6mvt7vgc5s3ik` (`event_id`),
  CONSTRAINT `FK3h2h9ru8ypagwqacqfjixda55` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKh4iky74ohuig6mvt7vgc5s3ik` FOREIGN KEY (`event_id`) REFERENCES `business_events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `event_ratings`
--

DROP TABLE IF EXISTS `event_ratings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `event_ratings` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `rating_value` int NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `event_id` bigint NOT NULL,
  `user_id` bigint NOT NULL,
  `flagged` bit(1) NOT NULL,
  `moderation_hidden` bit(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_event_rating_user_event` (`user_id`,`event_id`),
  KEY `FKsqvdeawjdfe6et60iepu8j3xg` (`event_id`),
  CONSTRAINT `FK89qljs3itr1tryu1aq0p7xcmk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `FKsqvdeawjdfe6et60iepu8j3xg` FOREIGN KEY (`event_id`) REFERENCES `business_events` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `governorates`
--

DROP TABLE IF EXISTS `governorates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `governorates` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `display_order` int NOT NULL,
  `name` varchar(120) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKjrfyuysa9xlw8ierxb1qthj5x` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `moderation_reports`
--

DROP TABLE IF EXISTS `moderation_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `moderation_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `admin_notes` varchar(2000) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(4000) DEFAULT NULL,
  `reason` varchar(2000) NOT NULL,
  `resolved_at` datetime(6) DEFAULT NULL,
  `status` enum('DISMISSED','OPEN','RESOLVED','REVIEWED') NOT NULL,
  `target_id` bigint DEFAULT NULL,
  `type` enum('BOOKING','BUSINESS_PROFILE','EVENT','OTHER','RATING','USER') NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `reporter_user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKel3242wawqlt439vtgang9r3s` (`reporter_user_id`),
  CONSTRAINT `FKel3242wawqlt439vtgang9r3s` FOREIGN KEY (`reporter_user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payment_methods`
--

DROP TABLE IF EXISTS `payment_methods`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment_methods` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `brand` varchar(32) NOT NULL,
  `card_holder_name` varchar(120) NOT NULL,
  `card_last4` varchar(4) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `expiry_month` int NOT NULL,
  `expiry_year` int NOT NULL,
  `is_default` bit(1) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKin7rtmim3ljrrhh5kxbq27s2v` (`user_id`),
  CONSTRAINT `FKin7rtmim3ljrrhh5kxbq27s2v` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `payments`
--

DROP TABLE IF EXISTS `payments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payments` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(14,2) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `currency` varchar(8) NOT NULL,
  `paypal_capture_id` varchar(64) DEFAULT NULL,
  `paypal_order_id` varchar(64) DEFAULT NULL,
  `provider` enum('PAYPAL') NOT NULL,
  `response_summary` varchar(2000) DEFAULT NULL,
  `status` enum('APPROVED','CANCELLED','CAPTURED','CREATED','FAILED') NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `booking_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKc52o2b1jkxttngufqp3t7jr3h` (`booking_id`),
  CONSTRAINT `FKc52o2b1jkxttngufqp3t7jr3h` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `refresh_tokens`
--

DROP TABLE IF EXISTS `refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refresh_tokens` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `expiry_date` datetime(6) NOT NULL,
  `revoked` bit(1) NOT NULL,
  `token` varchar(255) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKghpmfn23vmxfu3spu3lfg4r2d` (`token`),
  KEY `FK1lih5y2npsf8u5o3vhdb9y0os` (`user_id`),
  CONSTRAINT `FK1lih5y2npsf8u5o3vhdb9y0os` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=95 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` enum('ROLE_ADMIN','ROLE_BUSINESS','ROLE_USER') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKofx66keruapi6vyqpv6f2or37` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `subcategories`
--

DROP TABLE IF EXISTS `subcategories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subcategories` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `active` bit(1) NOT NULL,
  `name` varchar(120) NOT NULL,
  `slug` varchar(80) NOT NULL,
  `category_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subcategory_category_slug` (`category_id`,`slug`),
  CONSTRAINT `FKiborb6ptvy1t1n3v6klb56l5s` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_reports`
--

DROP TABLE IF EXISTS `user_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_reports` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `message` varchar(4000) NOT NULL,
  `status` enum('IN_PROGRESS','OPEN','RESOLVED') NOT NULL,
  `subject` varchar(200) NOT NULL,
  `updated_at` datetime(6) DEFAULT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKjbs1jmhgj4ecq8ohqwcsnurpk` (`user_id`),
  CONSTRAINT `FKjbs1jmhgj4ecq8ohqwcsnurpk` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `user_roles`
--

DROP TABLE IF EXISTS `user_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_roles` (
  `user_id` bigint NOT NULL,
  `role_id` bigint NOT NULL,
  PRIMARY KEY (`user_id`,`role_id`),
  KEY `FKh8ciramu9cc9q3qcqiv4ue8a6` (`role_id`),
  CONSTRAINT `FKh8ciramu9cc9q3qcqiv4ue8a6` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`),
  CONSTRAINT `FKhfh9dx7w3ubf1co1vdev94g3f` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `email` varchar(120) NOT NULL,
  `enabled` bit(1) NOT NULL,
  `first_name` varchar(80) NOT NULL,
  `last_name` varchar(80) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `profile_image_url` varchar(512) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UK6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-08  1:07:38
