// scripts/scheduler.js
// Cron scheduler for 7-day analytics simulation

import cron from 'node-cron';
import { runSimulation } from './simulate-analytics.js';

console.log('🚀 Analytics Simulation Scheduler');
console.log('=================================\n');
console.log('⏰  Schedule: Daily at 9:00 AM');
console.log('📅  Duration: 7 days');
console.log('🎯  Target: 100-200 views/day + comments + subscribers\n');

let isRunning = false;

// Run daily at 9:00 AM
const task = cron.schedule('0 9 * * *', async () => {
  if (isRunning) {
    console.log('⚠️  Previous simulation still running, skipping...');
    return;
  }
  
  isRunning = true;
  
  try {
    const result = await runSimulation();
    
    if (result.complete) {
      console.log('\n🎉 SIMULATION COMPLETE!');
      console.log('   7 days of analytics data generated');
      console.log('   Check your dashboard: http://localhost:3000/admin');
      console.log('\n⏹️  Stopping scheduler...\n');
      task.stop();
      process.exit(0);
    }
  } catch (error) {
    console.error('\n❌ Simulation error:', error.message);
  } finally {
    isRunning = false;
  }
}, {
  scheduled: true,
  timezone: 'UTC' // You can change this to your timezone
});

console.log('✅ Scheduler started successfully!');
console.log('   Next run: Tomorrow at 9:00 AM UTC');
console.log('   Press Ctrl+C to stop\n');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n⏹️  Stopping scheduler...');
  task.stop();
  console.log('   Scheduler stopped.\n');
  process.exit(0);
});

process.on('SIGTERM', () => {
  task.stop();
  process.exit(0);
});
