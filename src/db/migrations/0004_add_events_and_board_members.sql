-- Migration: Add events and board_members tables
-- Created manually for events and board members feature

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--> statement-breakpoint
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
