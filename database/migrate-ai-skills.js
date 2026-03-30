// Run: node database/migrate-ai-skills.js
// Adds AI & Automation skills to the skills table

const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });

const AI_SKILLS = [
  { name: 'ChatGPT / OpenAI', level: 3, level_percent: 88, sort_order: 1 },
  { name: 'Claude (Anthropic)', level: 3, level_percent: 85, sort_order: 2 },
  { name: 'Prompt Engineering', level: 3, level_percent: 90, sort_order: 3 },
  { name: 'GitHub Actions',     level: 2, level_percent: 78, sort_order: 4 },
  { name: 'n8n',                level: 2, level_percent: 72, sort_order: 5 },
  { name: 'Webhooks & APIs',    level: 3, level_percent: 85, sort_order: 6 },
];

async function run() {
  console.log('Adding AI & Automatisation skills...');
  for (const skill of AI_SKILLS) {
    await pool.query(
      `INSERT INTO skills (name, category, level, level_percent, sort_order, is_visible)
       VALUES ($1, 'ai', $2, $3, $4, true)
       ON CONFLICT DO NOTHING`,
      [skill.name, skill.level, skill.level_percent, skill.sort_order]
    );
    console.log(`  ✓ ${skill.name}`);
  }
  console.log('Done.');
  await pool.end();
}

run().catch(err => { console.error(err); process.exit(1); });
