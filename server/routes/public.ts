import https from 'https';
import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import pool from '../config/db';

const router = Router();

// GET /api/cv/:lang — proxy PDF download with correct filename and content-type
router.get('/cv/:lang', async (req: Request, res: Response) => {
  const { lang } = req.params;
  if (lang !== 'en' && lang !== 'fr') return res.status(400).json({ error: 'Invalid language' });
  try {
    const result = await pool.query('SELECT cv_url, cv_url_fr FROM profile LIMIT 1');
    const row = result.rows[0];
    const cvUrl: string | null = lang === 'fr' ? row?.cv_url_fr : row?.cv_url;
    if (!cvUrl) return res.status(404).json({ error: 'CV not found' });

    const filename = lang === 'fr' ? 'CV-Toure-Abdourahmane-FR.pdf' : 'CV-Toure-Abdourahmane-EN.pdf';

    https.get(cvUrl, (stream) => {
      if (stream.statusCode !== 200) {
        stream.resume();
        if (!res.headersSent) res.status(502).json({ error: 'Failed to fetch CV from storage' });
        return;
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      stream.pipe(res);
    }).on('error', (err) => {
      console.error(err);
      if (!res.headersSent) res.status(500).json({ error: 'Internal server error' });
    });
  } catch (err) {
    console.error(err);
    if (!res.headersSent) return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/profile
router.get('/profile', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM profile LIMIT 1');
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects
router.get('/projects', async (_req: Request, res: Response) => {
  try {
    const projectsResult = await pool.query(
      `SELECT p.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color, 'icon_url', t.icon_url))
          FILTER (WHERE t.id IS NOT NULL), '[]'
        ) AS technologies
       FROM projects p
       LEFT JOIN project_technologies pt ON p.id = pt.project_id
       LEFT JOIN technologies t ON pt.technology_id = t.id
       WHERE p.is_visible = true
       GROUP BY p.id
       ORDER BY p.sort_order ASC, p.created_at DESC`
    );
    return res.json(projectsResult.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/projects/:id
router.get('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const projectResult = await pool.query(
      `SELECT p.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color, 'icon_url', t.icon_url))
          FILTER (WHERE t.id IS NOT NULL), '[]'
        ) AS technologies,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', pi.id, 'image_url', pi.image_url, 'sort_order', pi.sort_order))
          FILTER (WHERE pi.id IS NOT NULL), '[]'
        ) AS images
       FROM projects p
       LEFT JOIN project_technologies pt ON p.id = pt.project_id
       LEFT JOIN technologies t ON pt.technology_id = t.id
       LEFT JOIN project_images pi ON p.id = pi.project_id
       WHERE p.id = $1
       GROUP BY p.id`,
      [id]
    );
    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    return res.json(projectResult.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/experiences
router.get('/experiences', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT e.*,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color, 'icon_url', t.icon_url))
          FILTER (WHERE t.id IS NOT NULL), '[]'
        ) AS technologies
       FROM experiences e
       LEFT JOIN experience_technologies et ON e.id = et.experience_id
       LEFT JOIN technologies t ON et.technology_id = t.id
       WHERE e.is_visible = true
       GROUP BY e.id
       ORDER BY e.sort_order ASC, e.date_start DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/skills
router.get('/skills', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.name, s.category, s.level,
              COALESCE(s.level_percent, CASE s.level WHEN 1 THEN 65 WHEN 2 THEN 80 WHEN 3 THEN 92 ELSE 80 END) AS level_percent,
              s.icon_name, s.sort_order, s.is_visible, s.technology_id,
              t.icon_url, t.color
       FROM skills s
       LEFT JOIN technologies t ON s.technology_id = t.id
       WHERE s.is_visible = true
       ORDER BY s.category, s.sort_order ASC`
    );
    const grouped: Record<string, typeof result.rows> = {};
    for (const skill of result.rows) {
      if (!grouped[skill.category]) grouped[skill.category] = [];
      grouped[skill.category].push(skill);
    }
    return res.json(grouped);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/contact
router.post(
  '/contact',
  [
    body('sender_name').trim().notEmpty().withMessage('Name is required').isLength({ max: 255 }),
    body('sender_email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('message').trim().notEmpty().withMessage('Message is required').isLength({ max: 5000 }),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { sender_name, sender_email, message } = req.body as {
      sender_name: string;
      sender_email: string;
      message: string;
    };

    try {
      await pool.query(
        `INSERT INTO contact_messages (sender_name, sender_email, message) VALUES ($1, $2, $3)`,
        [sender_name, sender_email, message]
      );
      return res.status(201).json({ success: true, message: 'Message received. I will get back to you soon!' });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;
