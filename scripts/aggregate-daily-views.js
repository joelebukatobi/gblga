#!/usr/bin/env node
// scripts/aggregate-daily-views.js
// Daily cron job to aggregate page views into daily_page_views table
// Run this once per day (recommended: at 12:05 AM)

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
config({ path: join(__dirname, '..', '.env.development') });

async function aggregateDailyViews() {
  console.log('📊 Running daily view aggregation...\n');

  try {
    // Dynamic import to ensure env is loaded
    const { analyticsService } = await import('../src/services/analytics.service.js');

    const result = await analyticsService.aggregateDailyViews();

    console.log('✅ Aggregation complete!');
    console.log(`   Date: ${result.date.toISOString().split('T')[0]}`);
    console.log(`   Total Views: ${result.totalViews.toLocaleString()}`);
    console.log(`   Action: ${result.action}`);

  } catch (error) {
    console.error('❌ Aggregation failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }

  console.log('\n✨ Done!');
  process.exit(0);
}

aggregateDailyViews();
