#!/usr/bin/env node
/**
 * Migration: add cv_url_fr column to profile table
 */
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('railway') ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  const client = await pool.connect();
  try {
    console.log('Adding cv_url_fr column to profile...');
    await client.query(`
      ALTER TABLE profile
      ADD COLUMN IF NOT EXISTS cv_url_fr VARCHAR(500)
    `);
    console.log('Done.');
  } finally {
    client.release();
    await pool.end();
  }
}

migrate().catch((err) => { console.error(err); process.exit(1); });
