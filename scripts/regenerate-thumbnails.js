// scripts/regenerate-thumbnails.js - Regenerate missing thumbnails
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import { existsSync, readdirSync } from 'fs';
import { Jimp } from 'jimp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IMAGES_DIR = join(__dirname, '..', 'public', 'uploads', 'images');
const THUMBS_DIR = join(IMAGES_DIR, 'thumbs');

async function generateThumbnail(sourcePath, outputPath) {
  try {
    console.log(`Generating thumbnail for ${basename(sourcePath)}...`);
    
    // Read image metadata first to check size
    const image = await Jimp.read(sourcePath);
    const width = image.width;
    const height = image.height;
    
    // If image is very large, resize in steps to reduce memory usage
    if (width > 4000 || height > 4000) {
      console.log(`  Large image detected (${width}x${height}), resizing in steps...`);
      
      // First resize to intermediate size (max 1000px)
      const intermediateSize = 1000;
      const scale = Math.min(intermediateSize / width, intermediateSize / height);
      const newWidth = Math.round(width * scale);
      const newHeight = Math.round(height * scale);
      
      await image.resize({ w: newWidth, h: newHeight });
      
      // Then resize to final thumbnail size
      await image.resize({ w: 200, h: 200 });
    } else {
      // Direct resize for smaller images
      await image.resize({ w: 200, h: 200 });
    }
    
    await image.write(outputPath);
    console.log(`✅ Created: ${basename(outputPath)}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to generate thumbnail for ${basename(sourcePath)}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🔍 Checking for missing thumbnails...\n');
  
  // Get all image files (excluding directories and .gitkeep)
  const imageFiles = readdirSync(IMAGES_DIR)
    .filter(file => {
      const ext = file.split('.').pop().toLowerCase();
      return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    })
    .sort();
  
  // Get all thumbnail files
  const thumbFiles = existsSync(THUMBS_DIR) ? readdirSync(THUMBS_DIR) : [];
  
  console.log(`Found ${imageFiles.length} images and ${thumbFiles.length} thumbnails\n`);
  
  // Find images without thumbnails
  const missingThumbs = [];
  
  for (const imageFile of imageFiles) {
    const baseName = imageFile.split('.')[0];
    const expectedThumb = `thumb-${imageFile}`;
    
    if (!thumbFiles.includes(expectedThumb)) {
      missingThumbs.push(imageFile);
    }
  }
  
  if (missingThumbs.length === 0) {
    console.log('✅ All thumbnails exist!');
    process.exit(0);
  }
  
  console.log(`Found ${missingThumbs.length} missing thumbnails:\n`);
  missingThumbs.forEach((file, i) => {
    console.log(`  ${i + 1}. ${file}`);
  });
  console.log('');
  
  // Generate missing thumbnails
  let successCount = 0;
  
  for (const imageFile of missingThumbs) {
    const sourcePath = join(IMAGES_DIR, imageFile);
    const thumbPath = join(THUMBS_DIR, `thumb-${imageFile}`);
    
    const success = await generateThumbnail(sourcePath, thumbPath);
    if (success) successCount++;
  }
  
  console.log(`\n🎉 Successfully generated ${successCount}/${missingThumbs.length} thumbnails`);
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
