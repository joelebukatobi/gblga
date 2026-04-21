#!/usr/bin/env node
// scripts/seed-traffic-data.js
// Seed mock traffic data for demonstration

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.development') });

async function seedTrafficData() {
  console.log('📊 Seeding traffic data...\n');

  try {
    // Dynamic import to ensure env is loaded
    const { analyticsService } = await import('../src/services/analytics.service.js');

    const daysToSeed = 30;
    console.log(`Generating ${daysToSeed} days of mock traffic data...`);

    const count = await analyticsService.seedMockTrafficData(daysToSeed);

    console.log(`✅ Successfully seeded ${count} days of traffic data!\n`);

    // Test the data by fetching it
    console.log('Testing data retrieval...');
    const data = await analyticsService.getTrafficData({ days: 7 });
    console.log(`Last 7 days summary:`);
    console.log(`  Total views: ${data.reduce((sum, d) => sum + d.views, 0).toLocaleString()}`);
    console.log(`  Data points: ${data.length}`);

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }

  console.log('\n✨ Done!');
  console.log('\nTo schedule daily aggregation, add this to your crontab:');
  console.log('  5 0 * * * node /path/to/scripts/aggregate-daily-views.js');
  process.exit(0);
}

seedTrafficData();
