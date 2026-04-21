// scripts/seed-subscribers.js
// Seed script to populate the subscribers table with test data

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env.development') });

const subscriberData = [
  { email: 'john.doe@example.com', name: 'John Doe', status: 'ACTIVE' },
  { email: 'jane.smith@example.com', name: 'Jane Smith', status: 'ACTIVE' },
  { email: 'mike.johnson@example.com', name: 'Mike Johnson', status: 'ACTIVE' },
  { email: 'sarah.williams@example.com', name: 'Sarah Williams', status: 'ACTIVE' },
  { email: 'david.brown@example.com', name: 'David Brown', status: 'ACTIVE' },
  { email: 'emily.davis@example.com', name: 'Emily Davis', status: 'ACTIVE' },
  { email: 'chris.wilson@example.com', name: 'Chris Wilson', status: 'ACTIVE' },
  { email: 'anna.miller@example.com', name: 'Anna Miller', status: 'PENDING' },
  { email: 'robert.taylor@example.com', name: 'Robert Taylor', status: 'PENDING' },
  { email: 'lisa.anderson@example.com', name: 'Lisa Anderson', status: 'PENDING' },
  { email: 'james.thomas@example.com', name: 'James Thomas', status: 'UNSUBSCRIBED' },
  { email: 'maria.jackson@example.com', name: 'Maria Jackson', status: 'UNSUBSCRIBED' },
  { email: 'william.white@example.com', name: 'William White', status: 'BOUNCED' },
  { email: 'patricia.harris@example.com', name: 'Patricia Harris', status: 'BOUNCED' },
  { email: 'thomas.clark@example.com', name: 'Thomas Clark', status: 'BOUNCED' },
  { email: 'linda.lewis@example.com', name: 'Linda Lewis', status: 'ACTIVE' },
  { email: 'charles.walker@example.com', name: 'Charles Walker', status: 'ACTIVE' },
  { email: 'barbara.hall@example.com', name: 'Barbara Hall', status: 'ACTIVE' },
  { email: 'daniel.young@example.com', name: 'Daniel Young', status: 'PENDING' },
  { email: 'elizabeth.king@example.com', name: 'Elizabeth King', status: 'PENDING' },
];

async function seedSubscribers() {
  try {
    console.log('🌱 Starting subscriber seed...\n');

    const { subscribersService } = await import('../src/services/subscribers.service.js');

    // Clear existing subscribers
    console.log('🗑️  Clearing existing subscribers...');
    const { db, subscribers } = await import('../src/db/index.js');
    const { sql } = await import('drizzle-orm');
    await db.execute(sql`DELETE FROM subscribers`);
    console.log('✅ Existing subscribers cleared\n');

    // Insert new subscribers
    console.log('📧 Creating subscribers...');
    let created = 0;
    let skipped = 0;

    for (const data of subscriberData) {
      try {
        // Check if email already exists
        const existing = await subscribersService.getSubscriberByEmail(data.email);
        if (existing) {
          console.log(`  ⚠️  Skipped: ${data.email} (already exists)`);
          skipped++;
          continue;
        }

        await subscribersService.createSubscriber(data);
        console.log(`  ✅ Created: ${data.name} (${data.email}) - ${data.status}`);
        created++;
      } catch (error) {
        console.error(`  ❌ Error creating ${data.email}:`, error.message);
      }
    }

    console.log('\n📊 Seed Summary:');
    console.log(`   Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${subscriberData.length}`);

    // Show breakdown by status
    const { getSubscriberCount } = subscribersService;
    const active = await subscribersService.getSubscriberCount({ status: 'ACTIVE' });
    const pending = await subscribersService.getSubscriberCount({ status: 'PENDING' });
    const unsubscribed = await subscribersService.getSubscriberCount({ status: 'UNSUBSCRIBED' });
    const bounced = await subscribersService.getSubscriberCount({ status: 'BOUNCED' });

    console.log('\n📈 Status Breakdown:');
    console.log(`   Active: ${active}`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Unsubscribed: ${unsubscribed}`);
    console.log(`   Bounced: ${bounced}`);

    console.log('\n✨ Subscriber seed completed!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seed failed:', error);
    process.exit(1);
  }
}

seedSubscribers();
