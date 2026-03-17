require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateI18n() {
  console.log('Running i18n migration...');

  try {
    // Profile table — add FR columns
    await pool.query(`ALTER TABLE profile ADD COLUMN IF NOT EXISTS title_fr VARCHAR(255)`);
    await pool.query(`ALTER TABLE profile ADD COLUMN IF NOT EXISTS subtitle_fr VARCHAR(500)`);
    await pool.query(`ALTER TABLE profile ADD COLUMN IF NOT EXISTS about_text_fr TEXT`);
    console.log('profile: i18n columns added.');

    // Projects table — add FR columns
    await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS title_fr VARCHAR(255)`);
    await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS description_fr TEXT`);
    await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS role_fr VARCHAR(255)`);
    await pool.query(`ALTER TABLE projects ADD COLUMN IF NOT EXISTS context_fr VARCHAR(255)`);
    console.log('projects: i18n columns added.');

    // Experiences table — add FR columns
    await pool.query(`ALTER TABLE experiences ADD COLUMN IF NOT EXISTS job_title_fr VARCHAR(255)`);
    await pool.query(`ALTER TABLE experiences ADD COLUMN IF NOT EXISTS description_fr TEXT`);
    console.log('experiences: i18n columns added.');

    console.log('i18n migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateI18n();
