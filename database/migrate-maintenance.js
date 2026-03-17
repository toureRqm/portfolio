require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateMaintenanceContent() {
  console.log('Running maintenance content migration...');
  try {
    await pool.query(`ALTER TABLE profile ADD COLUMN IF NOT EXISTS maintenance_message TEXT`);
    await pool.query(`ALTER TABLE profile ADD COLUMN IF NOT EXISTS maintenance_message_fr TEXT`);
    console.log('profile: maintenance_message columns added.');
    console.log('Migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateMaintenanceContent();
