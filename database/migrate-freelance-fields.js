const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function migrate() {
  const queries = [
    // Profile — freelance fields
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS availability_status VARCHAR(50) DEFAULT 'available'",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS availability_visible BOOLEAN DEFAULT true",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS location VARCHAR(255)",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS location_visible BOOLEAN DEFAULT true",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS phone VARCHAR(100)",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS phone_visible BOOLEAN DEFAULT false",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS daily_rate VARCHAR(100)",
    "ALTER TABLE profile ADD COLUMN IF NOT EXISTS daily_rate_visible BOOLEAN DEFAULT false",
    // Experience — contract type
    "ALTER TABLE experiences ADD COLUMN IF NOT EXISTS contract_type VARCHAR(50) DEFAULT 'freelance'",
  ];

  for (const sql of queries) {
    await pool.query(sql);
    console.log('✓', sql.replace(/ALTER TABLE \w+ ADD COLUMN IF NOT EXISTS /, ''));
  }
  console.log('\nMigration complete.');
  await pool.end();
}

migrate().catch((err) => { console.error(err); process.exit(1); });
