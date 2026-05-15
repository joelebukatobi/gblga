-- Migration: Add albums table and album_id to media_items
-- Created: 2025-01-25

-- Create albums table
CREATE TABLE IF NOT EXISTS albums (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL UNIQUE,
  description TEXT,
  cover_image_id VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT fk_albums_cover_image FOREIGN KEY (cover_image_id) REFERENCES media_items(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
--> statement-breakpoint
-- Add album_id to media_items
ALTER TABLE media_items
  ADD COLUMN album_id VARCHAR(36) NULL AFTER uploaded_by,
  ADD CONSTRAINT fk_media_items_album FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE SET NULL;
