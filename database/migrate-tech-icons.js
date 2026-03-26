import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  await pool.query(`ALTER TABLE technologies ADD COLUMN IF NOT EXISTS icon_url TEXT`);
  console.log('✓ icon_url column added to technologies');
  await pool.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
