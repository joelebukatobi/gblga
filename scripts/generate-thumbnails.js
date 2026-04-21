// scripts/generate-thumbnails.js
// Generate thumbnails for images that don't have them

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdirSync, existsSync, mkdirSync } from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.development') });

const IMAGES_DIR = join(__dirname, '..', 'public', 'uploads', 'images');
const THUMBS_DIR = join(IMAGES_DIR, 'thumbs');

async function generateThumbnails() {
  console.log('🖼️  Generating image thumbnails...\n');
  
  // Ensure thumbs directory exists
  if (!existsSync(THUMBS_DIR)) {
    mkdirSync(THUMBS_DIR, { recursive: true });
  }
  
  // Get all image files
  const files = readdirSync(IMAGES_DIR).filter(f => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(f)
  );
  
  let generated = 0;
  let skipped = 0;
  
  for (const file of files) {
    const inputPath = join(IMAGES_DIR, file);
    const outputPath = join(THUMBS_DIR, file);
    
    // Skip if thumbnail already exists
    if (existsSync(outputPath)) {
      console.log(`  ⏭️  ${file} (already exists)`);
      skipped++;
      continue;
    }
    
    try {
      await sharp(inputPath)
        .resize(400, 300, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 80 })
        .toFile(outputPath);
      
      console.log(`  ✅ ${file}`);
      generated++;
    } catch (err) {
      console.error(`  ❌ ${file}: ${err.message}`);
    }
  }
  
  console.log(`\n📊 Summary: ${generated} generated, ${skipped} skipped`);
}

generateThumbnails().catch(console.error);
