// scripts/simulate-day.js
// Simulate daily analytics data
// Usage: node scripts/simulate-day.js [--date=YYYY-MM-DD] [--days=N] [--backdate]

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.development') });

// Parse CLI arguments
const args = process.argv.slice(2);
const dateArg = args.find(arg => arg.startsWith('--date='))?.split('=')[1];
const daysArg = parseInt(args.find(arg => arg.startsWith('--days='))?.split('=')[1] || '1');
const isBackdate = args.includes('--backdate');

async function simulateDay() {
  console.log('📊 Starting analytics simulation...\n');
  
  const { db, dailyPageViews, analyticsEvents, posts, activities, users } = await import('../src/db/index.js');
  const { eq, sql, and, gte, lte } = await import('drizzle-orm');
  
  try {
    // Get all published posts
    const allPosts = await db.select({ 
      id: posts.id, 
      title: posts.title,
      viewCount: posts.viewCount 
    }).from(posts).where(eq(posts.status, 'PUBLISHED'));
    
    if (allPosts.length === 0) {
      console.log('⚠️  No published posts found. Please seed posts first.');
      return;
    }
    
    console.log(`Found ${allPosts.length} published posts\n`);
    
    // Determine dates to simulate
    const dates = [];
    
    if (dateArg) {
      // Specific date
      dates.push(new Date(dateArg));
    } else if (isBackdate && daysArg > 1) {
      // Multiple days going back
      for (let i = 0; i < daysArg; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        dates.push(date);
      }
    } else {
      // Today only
      dates.push(new Date());
    }
    
    let totalViews = 0;
    let totalEvents = 0;
    
    for (const simDate of dates) {
      const dateStr = simDate.toISOString().split('T')[0];
      console.log(`📅 Simulating: ${dateStr}`);
      
      // Check if data already exists for this date
      const existingData = await db.select().from(dailyPageViews).where(eq(dailyPageViews.date, dateStr));
      
      if (existingData.length > 0 && !args.includes('--force')) {
        console.log(`   ⚠️  Data already exists for ${dateStr} (use --force to overwrite)`);
        continue;
      }
      
      // Generate random daily stats
      const baseViews = Math.floor(Math.random() * 500) + 200; // 200-700 daily views
      const uniqueVisitors = Math.floor(baseViews * (0.6 + Math.random() * 0.3)); // 60-90% unique
      
      // Insert or update daily page views
      await db.insert(dailyPageViews).values({
        date: dateStr,
        totalViews: baseViews,
        uniqueVisitors: uniqueVisitors,
      }).onConflictDoUpdate({
        target: dailyPageViews.date,
        set: {
          totalViews: baseViews,
          uniqueVisitors: uniqueVisitors,
          updatedAt: new Date(),
        }
      });
      
      totalViews += baseViews;
      
      // Generate individual analytics events
      const eventCount = Math.floor(Math.random() * 50) + 20; // 20-70 events per day
      const eventTypes = ['page_view', 'post_view', 'scroll', 'time_on_page'];
      
      for (let i = 0; i < eventCount; i++) {
        const randomPost = allPosts[Math.floor(Math.random() * allPosts.length)];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        const eventTime = new Date(simDate);
        eventTime.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        await db.insert(analyticsEvents).values({
          type: eventType,
          postId: randomPost.id,
          path: `/blog/${randomPost.title.toLowerCase().replace(/\s+/g, '-')}`,
          metadata: {
            userAgent: 'Mozilla/5.0 (simulated)',
            referrer: Math.random() > 0.5 ? 'google.com' : 'direct',
          },
          createdAt: eventTime,
        });
        
        totalEvents++;
      }
      
      // Update post view counts (increment by random amount)
      for (const post of allPosts) {
        if (Math.random() > 0.3) { // 70% of posts get views
          const increment = Math.floor(Math.random() * 20) + 1;
          await db.update(posts).set({
            viewCount: sql`${posts.viewCount} + ${increment}`
          }).where(eq(posts.id, post.id));
        }
      }
      
      console.log(`   ✅ ${baseViews} views, ${uniqueVisitors} unique visitors, ${eventCount} events`);
    }
    
    // Log activity
    const adminUser = await db.select().from(users).where(eq(users.email, 'admin@example.com')).limit(1);
    if (adminUser.length > 0) {
      await db.insert(activities).values({
        userId: adminUser[0].id,
        type: 'SIMULATION_RUN',
        description: `Simulated ${dates.length} day(s) of analytics data`,
        metadata: {
          dates: dates.map(d => d.toISOString().split('T')[0]),
          totalViews,
          totalEvents,
        },
      });
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ SIMULATION COMPLETED!');
    console.log('='.repeat(50));
    console.log(`\n📊 Summary:`);
    console.log(`  📅 Days simulated: ${dates.length}`);
    console.log(`  👀 Total views: ${totalViews.toLocaleString()}`);
    console.log(`  📈 Total events: ${totalEvents.toLocaleString()}`);
    console.log(`  📝 Posts updated: ${allPosts.length}`);
    console.log('='.repeat(50) + '\n');
    
  } catch (error) {
    console.error('\n❌ SIMULATION FAILED:');
    console.error(error);
    process.exit(1);
  }
}

simulateDay();
