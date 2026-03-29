import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/db';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { upload } from '../config/upload';
import { uploadToCloudinary } from '../config/cloudinary';

const router = Router();

// ─── AUTH ─────────────────────────────────────────────────────────────────────

// POST /api/auth/login
router.post('/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const result = await pool.query('SELECT * FROM admin_user WHERE email = $1 LIMIT 1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const admin = result.rows[0] as { id: number; email: string; password_hash: string };
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    return res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/logout
router.post('/auth/logout', (_req: Request, res: Response) => {
  return res.json({ success: true });
});

// GET /api/auth/me
router.get('/auth/me', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT id, email FROM admin_user WHERE id = $1', [req.adminId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Admin not found' });
    const row = result.rows[0] as { id: number; email: string };
    return res.json({ id: row.id, email: row.email, name: row.email });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PROFILE ──────────────────────────────────────────────────────────────────

// GET /api/admin/profile
router.get('/admin/profile', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM profile LIMIT 1');
    if (result.rows.length === 0) return res.status(404).json({ error: 'Profile not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/profile
router.put('/admin/profile', requireAuth, async (req: AuthRequest, res: Response) => {
  const {
    name, title, title_fr, subtitle, subtitle_fr,
    about_text, about_text_fr, years_experience, projects_count,
    email, linkedin_url, github_url, twitter_url,
  } = req.body as Record<string, string | number>;
  try {
    const result = await pool.query(
      `UPDATE profile SET
        name = $1, title = $2, title_fr = $3, subtitle = $4, subtitle_fr = $5,
        about_text = $6, about_text_fr = $7, years_experience = $8, projects_count = $9,
        email = $10, linkedin_url = $11, github_url = $12, twitter_url = $13,
        updated_at = NOW()
       WHERE id = (SELECT id FROM profile LIMIT 1)
       RETURNING *`,
      [name, title, title_fr, subtitle, subtitle_fr, about_text, about_text_fr,
       years_experience, projects_count, email, linkedin_url, github_url, twitter_url]
    );
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/profile/photo
router.post('/admin/profile/photo', requireAuth, upload.single('photo'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, { folder: 'portfolio/profile' });
    const url = result.secure_url;
    await pool.query('UPDATE profile SET photo_url = $1, updated_at = NOW() WHERE id = (SELECT id FROM profile LIMIT 1)', [url]);
    return res.json({ url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/profile/logo
router.post('/admin/profile/logo', requireAuth, upload.single('logo'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, { folder: 'portfolio/profile' });
    const url = result.secure_url;
    await pool.query('UPDATE profile SET logo_url = $1, updated_at = NOW() WHERE id = (SELECT id FROM profile LIMIT 1)', [url]);
    return res.json({ url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/profile/logo
router.delete('/admin/profile/logo', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    await pool.query('UPDATE profile SET logo_url = NULL, updated_at = NOW() WHERE id = (SELECT id FROM profile LIMIT 1)');
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/profile/favicon
router.post('/admin/profile/favicon', requireAuth, upload.single('favicon'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, { folder: 'portfolio/profile' });
    const url = result.secure_url;
    await pool.query('UPDATE profile SET favicon_url = $1, updated_at = NOW() WHERE id = (SELECT id FROM profile LIMIT 1)', [url]);
    return res.json({ url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/profile/favicon
router.delete('/admin/profile/favicon', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    await pool.query('UPDATE profile SET favicon_url = NULL, updated_at = NOW() WHERE id = (SELECT id FROM profile LIMIT 1)');
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/profile/cv
router.post('/admin/profile/cv', requireAuth, upload.single('cv'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, { folder: 'portfolio/cv', resource_type: 'raw' });
    const url = result.secure_url;
    await pool.query('UPDATE profile SET cv_url = $1, updated_at = NOW() WHERE id = (SELECT id FROM profile LIMIT 1)', [url]);
    return res.json({ url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/profile/cv-fr
router.post('/admin/profile/cv-fr', requireAuth, upload.single('cv'), async (req: AuthRequest, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, { folder: 'portfolio/cv', resource_type: 'raw' });
    const url = result.secure_url;
    await pool.query('UPDATE profile SET cv_url_fr = $1, updated_at = NOW() WHERE id = (SELECT id FROM profile LIMIT 1)', [url]);
    return res.json({ url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── PROJECTS ─────────────────────────────────────────────────────────────────

const projectWithTechAndImages = `
  SELECT p.*,
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
`;

// GET /api/admin/projects
router.get('/admin/projects', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `${projectWithTechAndImages} GROUP BY p.id ORDER BY p.sort_order ASC, p.created_at DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/projects
router.post('/admin/projects', requireAuth, async (req: AuthRequest, res: Response) => {
  const {
    title, title_fr, description, description_fr, cover_image, role, role_fr,
    context, context_fr, date_start, date_end, status, demo_url, github_url,
    other_url, other_url_label, is_visible, technologies,
  } = req.body as Record<string, unknown>;
  try {
    const maxOrder = await pool.query('SELECT COALESCE(MAX(sort_order), 0) AS m FROM projects');
    const sortOrder = (maxOrder.rows[0].m as number) + 1;
    const result = await pool.query(
      `INSERT INTO projects (title, title_fr, description, description_fr, cover_image, role, role_fr,
        context, context_fr, date_start, date_end, status, demo_url, github_url, other_url, other_url_label,
        is_visible, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING *`,
      [title, title_fr || null, description, description_fr || null, cover_image || null,
       role, role_fr || null, context, context_fr || null, date_start || null, date_end || null,
       status || 'completed', demo_url || null, github_url || null, other_url || null,
       other_url_label || null, is_visible ?? true, sortOrder]
    );
    const project = result.rows[0] as { id: number };
    if (Array.isArray(technologies) && technologies.length > 0) {
      for (const tech of technologies as { id?: number; name: string; color: string }[]) {
        let techId: number;
        if (tech.id) {
          techId = tech.id;
        } else {
          const existing = await pool.query('SELECT id FROM technologies WHERE name = $1', [tech.name]);
          if (existing.rows.length > 0) {
            techId = (existing.rows[0] as { id: number }).id;
          } else {
            const newTech = await pool.query(
              'INSERT INTO technologies (name, color) VALUES ($1, $2) RETURNING id',
              [tech.name, tech.color || '#888888']
            );
            techId = (newTech.rows[0] as { id: number }).id;
          }
        }
        await pool.query('INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [project.id, techId]);
      }
    }
    const full = await pool.query(
      `${projectWithTechAndImages} WHERE p.id = $1 GROUP BY p.id`, [project.id]
    );
    return res.status(201).json(full.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/projects/:id
router.put('/admin/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    title, title_fr, description, description_fr, cover_image, role, role_fr,
    context, context_fr, date_start, date_end, status, demo_url, github_url,
    other_url, other_url_label, is_visible, technologies,
  } = req.body as Record<string, unknown>;
  try {
    await pool.query(
      `UPDATE projects SET
        title=$1, title_fr=$2, description=$3, description_fr=$4, cover_image=$5,
        role=$6, role_fr=$7, context=$8, context_fr=$9, date_start=$10, date_end=$11,
        status=$12, demo_url=$13, github_url=$14, other_url=$15, other_url_label=$16,
        is_visible=$17, updated_at=NOW()
       WHERE id=$18`,
      [title, title_fr || null, description, description_fr || null, cover_image || null,
       role, role_fr || null, context, context_fr || null, date_start || null, date_end || null,
       status, demo_url || null, github_url || null, other_url || null,
       other_url_label || null, is_visible, id]
    );
    if (Array.isArray(technologies)) {
      await pool.query('DELETE FROM project_technologies WHERE project_id = $1', [id]);
      for (const tech of technologies as { id?: number; name: string; color: string }[]) {
        let techId: number;
        if (tech.id) {
          techId = tech.id;
        } else {
          const existing = await pool.query('SELECT id FROM technologies WHERE name = $1', [tech.name]);
          if (existing.rows.length > 0) {
            techId = (existing.rows[0] as { id: number }).id;
          } else {
            const newTech = await pool.query(
              'INSERT INTO technologies (name, color) VALUES ($1, $2) RETURNING id',
              [tech.name, tech.color || '#888888']
            );
            techId = (newTech.rows[0] as { id: number }).id;
          }
        }
        await pool.query('INSERT INTO project_technologies (project_id, technology_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, techId]);
      }
    }
    const full = await pool.query(
      `${projectWithTechAndImages} WHERE p.id = $1 GROUP BY p.id`, [id]
    );
    if (full.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    return res.json(full.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/projects/:id
router.delete('/admin/projects/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM project_technologies WHERE project_id = $1', [id]);
    await pool.query('DELETE FROM project_images WHERE project_id = $1', [id]);
    const result = await pool.query('DELETE FROM projects WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/projects/:id/cover
router.post('/admin/projects/:id/cover', requireAuth, upload.single('cover'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, { folder: 'portfolio/projects' });
    const url = result.secure_url;
    await pool.query('UPDATE projects SET cover_image = $1, updated_at = NOW() WHERE id = $2', [url, id]);
    return res.json({ url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/projects/:id/images
router.post('/admin/projects/:id/images', requireAuth, upload.array('images', 10), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) return res.status(400).json({ error: 'No files uploaded' });
  try {
    const maxOrder = await pool.query('SELECT COALESCE(MAX(sort_order), 0) AS m FROM project_images WHERE project_id = $1', [id]);
    let sortOrder = (maxOrder.rows[0].m as number) + 1;
    const inserted = [];
    for (const file of files) {
      const result = await uploadToCloudinary(file.buffer, { folder: 'portfolio/projects' });
      const url = result.secure_url;
      const r = await pool.query(
        'INSERT INTO project_images (project_id, image_url, sort_order) VALUES ($1, $2, $3) RETURNING *',
        [id, url, sortOrder++]
      );
      inserted.push(r.rows[0]);
    }
    return res.status(201).json(inserted);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/projects/:id/images/:imageId
router.delete('/admin/projects/:id/images/:imageId', requireAuth, async (req: AuthRequest, res: Response) => {
  const { imageId } = req.params;
  try {
    const result = await pool.query('DELETE FROM project_images WHERE id = $1 RETURNING id', [imageId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Image not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/projects/reorder
router.put('/admin/projects/reorder', requireAuth, async (req: AuthRequest, res: Response) => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  try {
    for (let i = 0; i < ids.length; i++) {
      await pool.query('UPDATE projects SET sort_order = $1 WHERE id = $2', [i + 1, ids[i]]);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── EXPERIENCES ──────────────────────────────────────────────────────────────

const expWithTech = `
  SELECT e.*,
    COALESCE(
      json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'color', t.color, 'icon_url', t.icon_url))
      FILTER (WHERE t.id IS NOT NULL), '[]'
    ) AS technologies
  FROM experiences e
  LEFT JOIN experience_technologies et ON e.id = et.experience_id
  LEFT JOIN technologies t ON et.technology_id = t.id
`;

// GET /api/admin/experiences
router.get('/admin/experiences', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `${expWithTech} GROUP BY e.id ORDER BY e.sort_order ASC, e.date_start DESC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/experiences
router.post('/admin/experiences', requireAuth, async (req: AuthRequest, res: Response) => {
  const {
    job_title, job_title_fr, company, date_start, date_end, location,
    work_type, description, description_fr, is_visible, technologies,
  } = req.body as Record<string, unknown>;
  try {
    const maxOrder = await pool.query('SELECT COALESCE(MAX(sort_order), 0) AS m FROM experiences');
    const sortOrder = (maxOrder.rows[0].m as number) + 1;
    const result = await pool.query(
      `INSERT INTO experiences (job_title, job_title_fr, company, date_start, date_end, location,
        work_type, description, description_fr, is_visible, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [job_title, job_title_fr || null, company, date_start, date_end || null, location,
       work_type || 'on-site', description, description_fr || null, is_visible ?? true, sortOrder]
    );
    const exp = result.rows[0] as { id: number };
    if (Array.isArray(technologies) && technologies.length > 0) {
      for (const tech of technologies as { id?: number; name: string; color: string }[]) {
        let techId: number;
        if (tech.id) {
          techId = tech.id;
        } else {
          const existing = await pool.query('SELECT id FROM technologies WHERE name = $1', [tech.name]);
          if (existing.rows.length > 0) {
            techId = (existing.rows[0] as { id: number }).id;
          } else {
            const newTech = await pool.query(
              'INSERT INTO technologies (name, color) VALUES ($1, $2) RETURNING id',
              [tech.name, tech.color || '#888888']
            );
            techId = (newTech.rows[0] as { id: number }).id;
          }
        }
        await pool.query('INSERT INTO experience_technologies (experience_id, technology_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [exp.id, techId]);
      }
    }
    const full = await pool.query(`${expWithTech} WHERE e.id = $1 GROUP BY e.id`, [exp.id]);
    return res.status(201).json(full.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/experiences/:id
router.put('/admin/experiences/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const {
    job_title, job_title_fr, company, date_start, date_end, location,
    work_type, description, description_fr, is_visible, technologies,
  } = req.body as Record<string, unknown>;
  try {
    await pool.query(
      `UPDATE experiences SET
        job_title=$1, job_title_fr=$2, company=$3, date_start=$4, date_end=$5,
        location=$6, work_type=$7, description=$8, description_fr=$9, is_visible=$10, updated_at=NOW()
       WHERE id=$11`,
      [job_title, job_title_fr || null, company, date_start, date_end || null,
       location, work_type, description, description_fr || null, is_visible, id]
    );
    if (Array.isArray(technologies)) {
      await pool.query('DELETE FROM experience_technologies WHERE experience_id = $1', [id]);
      for (const tech of technologies as { id?: number; name: string; color: string }[]) {
        let techId: number;
        if (tech.id) {
          techId = tech.id;
        } else {
          const existing = await pool.query('SELECT id FROM technologies WHERE name = $1', [tech.name]);
          if (existing.rows.length > 0) {
            techId = (existing.rows[0] as { id: number }).id;
          } else {
            const newTech = await pool.query(
              'INSERT INTO technologies (name, color) VALUES ($1, $2) RETURNING id',
              [tech.name, tech.color || '#888888']
            );
            techId = (newTech.rows[0] as { id: number }).id;
          }
        }
        await pool.query('INSERT INTO experience_technologies (experience_id, technology_id) VALUES ($1, $2) ON CONFLICT DO NOTHING', [id, techId]);
      }
    }
    const full = await pool.query(`${expWithTech} WHERE e.id = $1 GROUP BY e.id`, [id]);
    if (full.rows.length === 0) return res.status(404).json({ error: 'Experience not found' });
    return res.json(full.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/experiences/:id
router.delete('/admin/experiences/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM experience_technologies WHERE experience_id = $1', [id]);
    const result = await pool.query('DELETE FROM experiences WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Experience not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/experiences/reorder
router.put('/admin/experiences/reorder', requireAuth, async (req: AuthRequest, res: Response) => {
  const { ids } = req.body as { ids: number[] };
  if (!Array.isArray(ids)) return res.status(400).json({ error: 'ids must be an array' });
  try {
    for (let i = 0; i < ids.length; i++) {
      await pool.query('UPDATE experiences SET sort_order = $1 WHERE id = $2', [i + 1, ids[i]]);
    }
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── TECHNOLOGIES LIBRARY ─────────────────────────────────────────────────────

// GET /api/admin/technologies
router.get('/admin/technologies', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM technologies ORDER BY name ASC');
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/technologies
router.post('/admin/technologies', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, color } = req.body as { name: string; color: string };
  if (!name) return res.status(400).json({ error: 'Name is required' });
  try {
    const result = await pool.query(
      'INSERT INTO technologies (name, color) VALUES ($1, $2) RETURNING *',
      [name.trim(), color || '#888888']
    );
    return res.status(201).json(result.rows[0]);
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'Technology already exists' });
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/technologies/:id
router.put('/admin/technologies/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, color } = req.body as { name: string; color: string };
  try {
    const result = await pool.query(
      'UPDATE technologies SET name = $1, color = $2 WHERE id = $3 RETURNING *',
      [name, color, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Technology not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/technologies/:id
router.delete('/admin/technologies/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM project_technologies WHERE technology_id = $1', [id]);
    await pool.query('DELETE FROM experience_technologies WHERE technology_id = $1', [id]);
    const result = await pool.query('DELETE FROM technologies WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Technology not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/technologies/:id/icon
router.post('/admin/technologies/:id/icon', requireAuth, upload.single('icon'), async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const result = await uploadToCloudinary(req.file.buffer, { folder: 'portfolio/technologies' });
    const url = result.secure_url;
    await pool.query('UPDATE technologies SET icon_url = $1 WHERE id = $2', [url, id]);
    return res.json({ url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── SKILLS ───────────────────────────────────────────────────────────────────

// GET /api/admin/skills
router.get('/admin/skills', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT s.*, t.icon_url, t.color
       FROM skills s
       LEFT JOIN technologies t ON s.technology_id = t.id
       ORDER BY s.category, s.sort_order ASC`
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/admin/skills
router.post('/admin/skills', requireAuth, async (req: AuthRequest, res: Response) => {
  const { name, category, level, level_percent, icon_name, is_visible, technology_id } = req.body as Record<string, unknown>;
  try {
    const maxOrder = await pool.query('SELECT COALESCE(MAX(sort_order), 0) AS m FROM skills WHERE category = $1', [category]);
    const sortOrder = (maxOrder.rows[0].m as number) + 1;
    const result = await pool.query(
      `INSERT INTO skills (name, category, level, level_percent, icon_name, is_visible, sort_order, technology_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, category, level || 2, level_percent ?? 80, icon_name || '', is_visible ?? true, sortOrder, technology_id || null]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/skills/:id
router.put('/admin/skills/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, category, level, level_percent, icon_name, is_visible, technology_id } = req.body as Record<string, unknown>;
  try {
    const result = await pool.query(
      `UPDATE skills SET name=$1, category=$2, level=$3, level_percent=$4, icon_name=$5, is_visible=$6, technology_id=$7
       WHERE id=$8 RETURNING *`,
      [name, category, level, level_percent ?? 80, icon_name, is_visible, technology_id || null, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Skill not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/skills/:id
router.delete('/admin/skills/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM skills WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Skill not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── MESSAGES ─────────────────────────────────────────────────────────────────

// GET /api/admin/messages
router.get('/admin/messages', requireAuth, async (_req: AuthRequest, res: Response) => {
  try {
    const result = await pool.query(
      'SELECT * FROM contact_messages ORDER BY created_at DESC'
    );
    return res.json(result.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/messages/:id/read
router.put('/admin/messages/:id/read', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { is_read } = req.body as { is_read: boolean };
  try {
    const result = await pool.query(
      'UPDATE contact_messages SET is_read = $1 WHERE id = $2 RETURNING *',
      [is_read ?? true, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    return res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/admin/messages/:id
router.delete('/admin/messages/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM contact_messages WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Message not found' });
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// ─── SETTINGS ─────────────────────────────────────────────────────────────────

// PUT /api/admin/settings/password
router.put('/admin/settings/password', requireAuth, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body as { currentPassword: string; newPassword: string };
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters' });
  }
  try {
    const result = await pool.query('SELECT * FROM admin_user WHERE id = $1', [req.adminId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Admin not found' });
    const admin = result.rows[0] as { password_hash: string };
    const valid = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE admin_user SET password_hash = $1 WHERE id = $2', [hash, req.adminId]);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/settings/maintenance-content
router.put('/admin/settings/maintenance-content', requireAuth, async (req: AuthRequest, res: Response) => {
  const { maintenance_message, maintenance_message_fr } = req.body as {
    maintenance_message: string;
    maintenance_message_fr: string;
  };
  try {
    await pool.query(
      `UPDATE profile SET maintenance_message = $1, maintenance_message_fr = $2, updated_at = NOW()
       WHERE id = (SELECT id FROM profile LIMIT 1)`,
      [maintenance_message || null, maintenance_message_fr || null]
    );
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/admin/settings/maintenance
router.put('/admin/settings/maintenance', requireAuth, async (req: AuthRequest, res: Response) => {
  const { maintenance_mode } = req.body as { maintenance_mode: boolean };
  try {
    await pool.query(
      'UPDATE profile SET maintenance_mode = $1, updated_at = NOW() WHERE id = (SELECT id FROM profile LIMIT 1)',
      [maintenance_mode]
    );
    return res.json({ success: true, maintenance_mode });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
