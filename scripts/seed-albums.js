// scripts/seed-albums.js - Create GBLGA albums and attach existing media
import { fileURLToPath } from 'url';
import { dirname, join, basename } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ensureDatabaseUrl } from './lib/load-env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load DATABASE_URL from .env files BEFORE any DB imports
ensureDatabaseUrl({ scriptName: 'seed-albums.js' });

// Now safe to import DB and sharp after env is loaded
const { db, albums, mediaItems, users } = await import('../src/db/index.js');
const { eq } = await import('drizzle-orm');
import sharp from 'sharp';
import crypto from 'crypto';

const IMAGES_DIR = join(__dirname, '..', 'public', 'uploads', 'images');
const THUMBS_DIR = join(IMAGES_DIR, 'thumbs');

const ALBUMS = [
  { title: 'GBLGA Meet & Greet', slug: 'gblga-meet-and-greet', description: 'Welcome events for new and returning members of the Gambia Business & Logistics Graduates Association.' },
  { title: 'Cultural Exchange Night', slug: 'cultural-exchange-night', description: 'Evenings celebrating diverse cultures through food, music, and presentations.' },
  { title: 'Community Service Day', slug: 'community-service-day', description: 'Members giving back to the community through outreach and volunteer work.' },
  { title: 'Annual Conference', slug: 'annual-conference', description: 'Our flagship yearly conference bringing together members, partners, and industry leaders.' },
  { title: 'Team Building Events', slug: 'team-building-events', description: 'Fun activities and retreats that strengthen bonds between GBLGA members.' },
  { title: 'Student Life', slug: 'student-life', description: 'Snapshots from campus, study sessions, and everyday student experiences.' },
  { title: 'Campus Highlights', slug: 'campus-highlights', description: 'Beautiful moments captured around the university grounds and facilities.' },
];

const FALLBACK_USER_ID = '00000000-0000-0000-0000-000000000001';

async function generateThumbnail(sourcePath, outputPath) {
  try {
    await sharp(sourcePath)
      .resize(200, 200, { fit: 'cover' })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`  ⚠ Thumbnail failed for ${basename(sourcePath)}: ${error.message}`);
    return false;
  }
}

async function seed() {
  console.log('🌱 Seeding albums and attaching media...\n');

  try {
    if (!existsSync(THUMBS_DIR)) {
      mkdirSync(THUMBS_DIR, { recursive: true });
    }

    const adminUser = await db.select().from(users).where(eq(users.email, 'admin@example.com')).limit(1);
    const adminId = adminUser.length > 0 ? adminUser[0].id : FALLBACK_USER_ID;
    console.log(`✅ Using user: ${adminId}\n`);

    const allMedia = await db.select().from(mediaItems);
    const images = allMedia.filter(m => m.type === 'IMAGE');
    const videos = allMedia.filter(m => m.type === 'VIDEO');
    console.log(`Found ${images.length} images, ${videos.length} videos (${allMedia.length} total)\n`);

    // Seed untracked images on disk
    const { readdirSync, statSync } = await import('fs');
    const diskFiles = readdirSync(IMAGES_DIR).filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f) && !f.startsWith('thumb-'));
    const dbFilenames = new Set(allMedia.map(m => m.filename));
    const untracked = diskFiles.filter(f => !dbFilenames.has(f));

    if (untracked.length > 0) {
      console.log(`📦 Found ${untracked.length} images on disk not in DB, seeding...\n`);
      for (const filename of untracked) {
        const filePath = join(IMAGES_DIR, filename);
        const thumbFilename = `thumb-${filename}`;
        const thumbPath = join(THUMBS_DIR, thumbFilename);
        const ext = filename.split('.').pop();
        const mediaId = crypto.randomUUID();

        let width = null, height = null;
        try {
          const metadata = await sharp(filePath).metadata();
          width = metadata.width;
          height = metadata.height;
        } catch (e) {}

        const size = statSync(filePath).size;

        await generateThumbnail(filePath, thumbPath);

        await db.insert(mediaItems).values({
          id: mediaId,
          type: 'IMAGE',
          filename,
          originalName: filename,
          mimeType: `image/${ext}`,
          size,
          width,
          height,
          path: `/public/uploads/images/${filename}`,
          thumbnailPath: `/public/uploads/images/thumbs/${thumbFilename}`,
          uploadedBy: adminId,
        });

        images.push({ id: mediaId, type: 'IMAGE', filename, albumId: null });
        console.log(`  ✅ Added: ${filename}`);
      }
      console.log('');
    }

    // Create albums
    const createdAlbums = [];
    for (const albumData of ALBUMS) {
      const albumId = crypto.randomUUID();

      await db.insert(albums).values({
        id: albumId,
        title: albumData.title,
        slug: albumData.slug,
        description: albumData.description,
      });

      createdAlbums.push({ id: albumId, ...albumData });
      console.log(`  📁 Created album: ${albumData.title} (${albumData.slug})`);
    }
    console.log('');

    // Skip system images
    const skipPatterns = ['newsletter-bg', 'featured-posts', 'gblga-bhm-ig'];
    const assignableImages = images.filter(img =>
      !skipPatterns.some(p => img.filename.toLowerCase().includes(p))
    );

    console.log(`Distributing ${assignableImages.length} images + ${videos.length} videos across ${createdAlbums.length} albums...\n`);

    const mixedMedia = [...assignableImages, ...videos];
    const albumMediaMap = new Map();

    for (const album of createdAlbums) {
      albumMediaMap.set(album.id, []);
    }

    // Round-robin distribute
    mixedMedia.forEach((media, idx) => {
      const albumIndex = idx % createdAlbums.length;
      const album = createdAlbums[albumIndex];
      albumMediaMap.get(album.id).push(media.id);
    });

    // Attach media to albums and set covers
    for (const album of createdAlbums) {
      const mediaIds = albumMediaMap.get(album.id);

      const coverMedia = mediaIds
        .map(id => mixedMedia.find(m => m.id === id))
        .find(m => m.type === 'IMAGE')
        || mediaIds
          .map(id => mixedMedia.find(m => m.id === id))
          .find(m => m);

      for (const mediaId of mediaIds) {
        await db
          .update(mediaItems)
          .set({ albumId: album.id })
          .where(eq(mediaItems.id, mediaId));
      }

      if (coverMedia) {
        await db
          .update(albums)
          .set({ coverImageId: coverMedia.id })
          .where(eq(albums.id, album.id));
        console.log(`  🖼️  ${album.title}: ${mediaIds.length} items, cover: ${coverMedia.filename}`);
      } else {
        console.log(`  📁 ${album.title}: ${mediaIds.length} items (no cover)`);
      }
    }

    console.log(`\n🎉 Done! Created ${createdAlbums.length} albums and attached ${mixedMedia.length} media items.\n`);

    console.log('Albums created:');
    for (const album of createdAlbums) {
      const count = albumMediaMap.get(album.id).length;
      console.log(`  • ${album.title} (${count} items) - /gallery/${album.slug}`);
    }

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }

  process.exit(0);
}

seed();
