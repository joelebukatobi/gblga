-- Migration: Add custom application tables
-- Consolidated: setup_tokens, events, board_members, albums
-- Created: 2026-05-15

-- Setup tokens for initial admin creation wizard
CREATE TABLE IF NOT EXISTS `setup_tokens` (
	`id` varchar(36) NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`used_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `setup_tokens_token_hash_unique` UNIQUE(`token_hash`)
);

--> statement-breakpoint

-- Events table for public events page
CREATE TABLE IF NOT EXISTS `events` (
  `id` varchar(36) NOT NULL,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL,
  `description` text,
  `location` varchar(255),
  `event_date` timestamp,
  `event_time` varchar(20),
  `status` enum('UPCOMING','ONGOING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'UPCOMING',
  `featured_image_id` varchar(36),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `events_slug_unique` (`slug`),
  KEY `events_status_idx` (`status`),
  KEY `events_event_date_idx` (`event_date`),
  KEY `events_featured_image_id_idx` (`featured_image_id`),
  CONSTRAINT `events_featured_image_id_media_items_id_fk` FOREIGN KEY (`featured_image_id`) REFERENCES `media_items` (`id`) ON DELETE SET NULL
);

--> statement-breakpoint

-- Board members table for public board page
CREATE TABLE IF NOT EXISTS `board_members` (
  `id` varchar(36) NOT NULL,
  `name` varchar(200) NOT NULL,
  `role` varchar(100) NOT NULL,
  `email` varchar(255),
  `bio` text,
  `type` enum('SENIOR','JUNIOR') NOT NULL DEFAULT 'SENIOR',
  `year` int NOT NULL,
  `photo_id` varchar(36),
  `photo_url` varchar(255),
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `board_members_type_idx` (`type`),
  KEY `board_members_year_idx` (`year`),
  KEY `board_members_photo_id_idx` (`photo_id`),
  CONSTRAINT `board_members_photo_id_media_items_id_fk` FOREIGN KEY (`photo_id`) REFERENCES `media_items` (`id`) ON DELETE SET NULL
);

--> statement-breakpoint

-- Albums table for gallery
CREATE TABLE IF NOT EXISTS `albums` (
  `id` varchar(36) NOT NULL PRIMARY KEY,
  `title` varchar(200) NOT NULL,
  `slug` varchar(200) NOT NULL UNIQUE,
  `description` TEXT,
  `cover_image_id` varchar(36),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT `fk_albums_cover_image` FOREIGN KEY (`cover_image_id`) REFERENCES `media_items` (`id`) ON DELETE SET NULL
);

--> statement-breakpoint

-- Add album_id to media_items for gallery organization
ALTER TABLE `media_items`
  ADD COLUMN `album_id` varchar(36) NULL AFTER `uploaded_by`,
  ADD CONSTRAINT `fk_media_items_album` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`) ON DELETE SET NULL;
