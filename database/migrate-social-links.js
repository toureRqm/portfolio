// Run: node database/migrate-social-links.js
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

async function run() {
  console.log('Creating social_links table...');
  await pool.query(`
    CREATE TABLE IF NOT EXISTS social_links (
      id SERIAL PRIMARY KEY,
      label VARCHAR(100) NOT NULL,
      url VARCHAR(500) NOT NULL,
      icon_name VARCHAR(50) NOT NULL DEFAULT 'globe',
      sort_order INTEGER DEFAULT 0,
      is_visible BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Seed default links
  const existing = await pool.query('SELECT COUNT(*) FROM social_links');
  if (parseInt(existing.rows[0].count) === 0) {
    console.log('Seeding default social links...');
    await pool.query(`
      INSERT INTO social_links (label, url, icon_name, sort_order) VALUES
        ('LinkedIn', 'https://www.linkedin.com/in/abdou-rahmane-toure-986358216/', 'linkedin', 1),
        ('GitHub',   'https://github.com/abdourahmane', 'github', 2),
        ('Email',    'mailto:abdourahmane.toure674@gmail.com', 'mail', 3);
    `);
  }

  console.log('Done.');
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
