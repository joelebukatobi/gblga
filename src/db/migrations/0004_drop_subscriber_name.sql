CREATE TABLE `albums` (
	`id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`cover_image_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `albums_id` PRIMARY KEY(`id`),
	CONSTRAINT `albums_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `board_members` (
	`id` varchar(36) NOT NULL,
	`name` varchar(200) NOT NULL,
	`role` varchar(100) NOT NULL,
	`email` varchar(255),
	`bio` text,
	`type` enum('SENIOR','JUNIOR') NOT NULL DEFAULT 'SENIOR',
	`year` int NOT NULL,
	`photo_id` varchar(36),
	`photo_url` varchar(255),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `board_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` varchar(36) NOT NULL,
	`title` varchar(200) NOT NULL,
	`slug` varchar(200) NOT NULL,
	`description` text,
	`location` varchar(255),
	`event_date` timestamp,
	`event_time` varchar(20),
	`status` enum('UPCOMING','ONGOING','COMPLETED','CANCELLED') NOT NULL DEFAULT 'UPCOMING',
	`featured_image_id` varchar(36),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `events_id` PRIMARY KEY(`id`),
	CONSTRAINT `events_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `activities` MODIFY COLUMN `type` enum('POST_CREATED','POST_UPDATED','POST_PUBLISHED','POST_DELETED','CATEGORY_CREATED','CATEGORY_UPDATED','CATEGORY_DELETED','TAG_CREATED','TAG_UPDATED','TAG_DELETED','USER_CREATED','USER_UPDATED','USER_DELETED','USER_INVITED','USER_SUSPENDED','USER_ACTIVATED','IMAGE_UPLOADED','IMAGE_UPDATED','IMAGE_DELETED','VIDEO_UPLOADED','VIDEO_UPDATED','VIDEO_DELETED','LOGIN','LOGOUT','SETTINGS_UPDATED','COMMENT_CREATED','SUBSCRIBER_CREATED','EVENT_CREATED','EVENT_UPDATED','EVENT_DELETED','BOARD_MEMBER_CREATED','BOARD_MEMBER_UPDATED','BOARD_MEMBER_DELETED') NOT NULL;--> statement-breakpoint
ALTER TABLE `media_items` ADD `album_id` varchar(36);--> statement-breakpoint
ALTER TABLE `albums` ADD CONSTRAINT `albums_cover_image_id_media_items_id_fk` FOREIGN KEY (`cover_image_id`) REFERENCES `media_items`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `board_members` ADD CONSTRAINT `board_members_photo_id_media_items_id_fk` FOREIGN KEY (`photo_id`) REFERENCES `media_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `events` ADD CONSTRAINT `events_featured_image_id_media_items_id_fk` FOREIGN KEY (`featured_image_id`) REFERENCES `media_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_items` ADD CONSTRAINT `media_items_album_id_albums_id_fk` FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscribers` DROP COLUMN `name`;