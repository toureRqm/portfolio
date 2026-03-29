// Migration: add level_percent (0-100) to skills table
// Run: node database/migrate-skill-level-percent.js

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  console.log('Adding level_percent column to skills...');

  await pool.query(`
    ALTER TABLE skills
    ADD COLUMN IF NOT EXISTS level_percent INTEGER DEFAULT 80
    CHECK (level_percent >= 0 AND level_percent <= 100)
  `);

  // Populate from existing level (1→65, 2→80, 3→92)
  await pool.query(`
    UPDATE skills
    SET level_percent = CASE
      WHEN level = 1 THEN 65
      WHEN level = 2 THEN 80
      WHEN level = 3 THEN 92
      ELSE 80
    END
    WHERE level_percent = 80
  `);

  console.log('Done. level_percent column added and populated.');
  await pool.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
