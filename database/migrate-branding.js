import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  await pool.query(`ALTER TABLE profile ADD COLUMN IF NOT EXISTS logo_url TEXT`);
  await pool.query(`ALTER TABLE profile ADD COLUMN IF NOT EXISTS favicon_url TEXT`);
  console.log('✓ Branding columns added (logo_url, favicon_url)');
  await pool.end();
}

run().catch((e) => { console.error(e); process.exit(1); });
