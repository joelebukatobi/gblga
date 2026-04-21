// Script to clean up duplicate images - keep only 2 most recent
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
import { db, mediaItems } from '../src/db/index.js';
import { eq, inArray } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function cleanupDuplicates() {
  try {
    // Get all image media items ordered by creation date (newest first)
    const images = await db
      .select({
        id: mediaItems.id,
        filename: mediaItems.filename,
        path: mediaItems.path,
        createdAt: mediaItems.createdAt,
      })
      .from(mediaItems)
      .where(eq(mediaItems.type, 'IMAGE'))
      .orderBy(mediaItems.createdAt);

    console.log('Found', images.length, 'image records');

    if (images.length <= 2) {
      console.log('2 or fewer images, nothing to clean up');
      return;
    }

    // Keep the 2 most recent, delete the rest
    const toDelete = images.slice(0, images.length - 2);
    const toKeep = images.slice(images.length - 2);

    console.log('\nKeeping 2 most recent:');
    toKeep.forEach(img => console.log('  -', img.filename, '(', img.createdAt, ')'));

    console.log('\nDeleting older duplicates:');
    toDelete.forEach(img => console.log('  -', img.filename, '(', img.createdAt, ')'));

    // Delete from database and filesystem
    for (const img of toDelete) {
      try {
        // Delete from database
        await db.delete(mediaItems).where(eq(mediaItems.id, img.id));
        console.log('Deleted from DB:', img.filename);

        // Delete file from filesystem
        const filePath = path.join(process.cwd(), img.path.replace('/public/', 'public/'));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log('Deleted file:', filePath);
        } else {
          console.log('File not found (already deleted?):', filePath);
        }
      } catch (err) {
        console.error('Error deleting', img.filename, ':', err.message);
      }
    }

    console.log('\n✅ Cleanup complete!');
    console.log('Kept 2 most recent images');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    process.exit(0);
  }
}

cleanupDuplicates();
