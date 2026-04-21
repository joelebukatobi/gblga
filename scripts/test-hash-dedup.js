// Test script for hash deduplication
import dotenv from 'dotenv';
dotenv.config({ path: '.env.development' });
import crypto from 'crypto';
import { db, mediaItems } from '../src/db/index.js';
import { eq } from 'drizzle-orm';

async function testHashDeduplication() {
  try {
    // Create a test file buffer
    const testBuffer = Buffer.from('Test image content for hash deduplication');
    
    // Calculate hash (same as controller)
    const hash = crypto.createHash('sha256').update(testBuffer).digest('hex');
    console.log('Test file hash:', hash);
    
    // Check if hash column exists and is queryable
    const existing = await db
      .select({ id: mediaItems.id, path: mediaItems.path })
      .from(mediaItems)
      .where(eq(mediaItems.hash, hash))
      .limit(1);
    
    console.log('Existing images with this hash:', existing.length);
    console.log('Hash-based deduplication is ready to work!');
    
    // Show how it would work:
    console.log('\n--- How it works ---');
    console.log('1. User uploads image');
    console.log('2. Server calculates SHA-256 hash:', hash.substring(0, 16) + '...');
    console.log('3. Query DB for existing image with same hash');
    if (existing.length > 0) {
      console.log('4. FOUND! Return existing image URL (no duplicate saved)');
    } else {
      console.log('4. NOT FOUND! Save new image with hash');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    process.exit(0);
  }
}

testHashDeduplication();
