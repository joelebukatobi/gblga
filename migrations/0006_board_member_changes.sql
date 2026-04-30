ALTER TABLE board_members
  ADD COLUMN photo_url VARCHAR(255) NULL AFTER photo_id,
  DROP COLUMN is_active,
  DROP COLUMN `order`;
