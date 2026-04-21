// scripts/seed-more-categories-tags.js
// Seed script to add more categories and tags for pagination testing

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.development') });

const additionalCategories = [
  { title: 'React', slug: 'react', description: 'React tutorials and guides', colorClass: 'badge--primary' },
  { title: 'Vue.js', slug: 'vuejs', description: 'Vue.js framework content', colorClass: 'badge--secondary' },
  { title: 'Angular', slug: 'angular', description: 'Angular development articles', colorClass: 'badge--danger' },
  { title: 'Python', slug: 'python', description: 'Python programming tutorials', colorClass: 'badge--success' },
  { title: 'DevOps', slug: 'devops', description: 'DevOps practices and tools', colorClass: 'badge--warning' },
  { title: 'Cloud', slug: 'cloud', description: 'Cloud computing and services', colorClass: 'badge--info' },
  { title: 'AI/ML', slug: 'ai-ml', description: 'Artificial Intelligence and Machine Learning', colorClass: 'badge--primary' },
  { title: 'Mobile', slug: 'mobile', description: 'Mobile app development', colorClass: 'badge--secondary' },
  { title: 'Database', slug: 'database', description: 'Database design and optimization', colorClass: 'badge--success' },
  { title: 'API', slug: 'api', description: 'API design and development', colorClass: 'badge--info' },
  { title: 'Testing', slug: 'testing', description: 'Software testing strategies', colorClass: 'badge--warning' },
  { title: 'Security', slug: 'security', description: 'Web security best practices', colorClass: 'badge--danger' },
  { title: 'Career', slug: 'career', description: 'Developer career growth', colorClass: 'badge--neutral' },
  { title: 'Tools', slug: 'tools', description: 'Developer tools and productivity', colorClass: 'badge--primary' },
];

const additionalTags = [
  { name: 'React', slug: 'react', description: 'React library content' },
  { name: 'Vue', slug: 'vue', description: 'Vue.js framework' },
  { name: 'TypeScript', slug: 'typescript', description: 'TypeScript language' },
  { name: 'Node.js', slug: 'nodejs', description: 'Node.js runtime' },
  { name: 'Docker', slug: 'docker', description: 'Docker containers' },
  { name: 'AWS', slug: 'aws', description: 'Amazon Web Services' },
  { name: 'Git', slug: 'git', description: 'Version control with Git' },
  { name: 'AI', slug: 'ai', description: 'Artificial Intelligence' },
  { name: 'Machine Learning', slug: 'machine-learning', description: 'ML concepts' },
  { name: 'Testing', slug: 'testing', description: 'Software testing' },
  { name: 'API Design', slug: 'api-design', description: 'REST API design' },
  { name: 'Career', slug: 'career', description: 'Developer career' },
];

async function seedMoreData() {
  try {
    console.log('🌱 Starting additional categories and tags seed...\n');

    const { db, categories, tags } = await import('../src/db/index.js');
    const { eq, sql } = await import('drizzle-orm');

    // Add Categories
    console.log('📁 Adding new categories...');
    let categoriesAdded = 0;
    for (const cat of additionalCategories) {
      try {
        // Check if category exists
        const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug)).limit(1);
        if (existing.length === 0) {
          await db.insert(categories).values({
            title: cat.title,
            slug: cat.slug,
            description: cat.description,
            colorClass: cat.colorClass,
          });
          console.log(`  ✅ Created category: ${cat.title}`);
          categoriesAdded++;
        } else {
          console.log(`  ⚠️  Skipped: ${cat.title} (already exists)`);
        }
      } catch (error) {
        console.error(`  ❌ Error creating ${cat.title}:`, error.message);
      }
    }

    // Add Tags
    console.log('\n🏷️  Adding new tags...');
    let tagsAdded = 0;
    for (const tag of additionalTags) {
      try {
        // Check if tag exists
        const existing = await db.select().from(tags).where(eq(tags.slug, tag.slug)).limit(1);
        if (existing.length === 0) {
          await db.insert(tags).values({
            name: tag.name,
            slug: tag.slug,
            description: tag.description,
          });
          console.log(`  ✅ Created tag: ${tag.name}`);
          tagsAdded++;
        } else {
          console.log(`  ⚠️  Skipped: ${tag.name} (already exists)`);
        }
      } catch (error) {
        console.error(`  ❌ Error creating ${tag.name}:`, error.message);
      }
    }

    // Get totals
    const catCount = await db.select({ count: sql`count(*)` }).from(categories);
    const tagCount = await db.select({ count: sql`count(*)` }).from(tags);

    console.log('\n📊 Final Counts:');
    console.log(`   Categories: ${catCount[0].count} (${categoriesAdded} new)`);
    console.log(`   Tags: ${tagCount[0].count} (${tagsAdded} new)`);
    console.log('\n✨ Seed completed! Ready for pagination testing.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

seedMoreData();
