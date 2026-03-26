import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  await pool.query(`
    ALTER TABLE skills
    ADD COLUMN IF NOT EXISTS technology_id INTEGER REFERENCES technologies(id) ON DELETE SET NULL
  `);
  console.log('✓ technology_id column added to skills');
  await pool.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
