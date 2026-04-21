// scripts/update-category-colors.js
import { db, categories } from '../src/db/index.js';
import { eq } from 'drizzle-orm';

const categoryColors = [
  'badge--primary',
  'badge--purple',
  'badge--info',
  'badge--warning',
  'badge--success',
  'badge--danger',
  'badge--pink',
  'badge--neutral'
];

const categorySlugs = ['development', 'design', 'css', 'javascript', 'tutorials', 'news'];

async function updateColors() {
  console.log('Updating category colors...\n');
  
  for (let i = 0; i < categorySlugs.length; i++) {
    const slug = categorySlugs[i];
    const color = categoryColors[i % categoryColors.length];
    
    await db.update(categories)
      .set({ colorClass: color })
      .where(eq(categories.slug, slug));
    
    console.log(`✅ ${slug} → ${color}`);
  }
  
  console.log('\n✅ Category colors updated successfully!');
  process.exit(0);
}

updateColors().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
