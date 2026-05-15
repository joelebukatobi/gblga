#!/usr/bin/env node
// scripts/migrate.js
// Run database migrations programmatically
// Skips if migrations have already been applied

import { ensureDatabaseUrl } from './lib/load-env.js';
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { migrate } from 'drizzle-orm/mysql2/migrator';
import { readFile } from 'fs/promises';

// Load DATABASE_URL from available sources
ensureDatabaseUrl({ scriptName: 'migrate.js' });

const DATABASE_URL = process.env.DATABASE_URL;

/**
 * Check if migrations need to be run
 * Returns true if migrations should run, false if already applied
 */
async function shouldRunMigrations(connection) {
  try {
    // Check if __drizzle_migrations table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE '__drizzle_migrations'"
    );

    if (tables.length === 0) {
      console.log('📋 No migrations table found - fresh database');
      return true;
    }

    // Get all migration files from journal
    const journalPath = new URL('../src/db/migrations/meta/_journal.json', import.meta.url);
    const journal = JSON.parse(await readFile(journalPath, 'utf8'));
    const allMigrations = journal.entries.map(e => e.tag);

    // Get already applied migrations from DB
    const [rows] = await connection.query(
      "SELECT hash FROM __drizzle_migrations"
    );
    const appliedMigrations = new Set(rows.map(r => r.hash));

    // Find pending migrations
    const pending = allMigrations.filter(m => !appliedMigrations.has(m));

    if (pending.length === 0) {
      console.log(`📊 All ${allMigrations.length} migrations applied - nothing pending`);
      return false;
    }

    console.log(`📊 ${appliedMigrations.size}/${allMigrations.length} applied, ${pending.length} pending:`);
    pending.forEach(m => console.log(`   - ${m}`));
    return true;
  } catch (error) {
    console.log('⚠️  Could not check migration status:', error.message);
    return true;
  }
}

async function runMigrations() {
  console.log('🔄 Checking database state...\n');

  const connection = await mysql.createConnection(DATABASE_URL);

  try {
    // Check if migrations are needed
    const needsMigration = await shouldRunMigrations(connection);

    if (!needsMigration) {
      console.log('✅ Database already has migrations applied - skipping');
      process.exit(0);
    }

    console.log('🔄 Running database migrations...\n');

    const db = drizzle(connection);

    // Run migrations from the migrations folder
    await migrate(db, { migrationsFolder: './src/db/migrations' });

    console.log('✅ Migrations completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

runMigrations();
