import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import publicRoutes from './routes/public';
import adminRoutes from './routes/admin';
import pool from './config/db';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? process.env.SITE_URL
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.resolve(uploadDir)));

// Serve existing static media from root portfolio directory
// __dirname = server/dist/ in prod, so ../../static = project root/static
app.use('/static', express.static(path.resolve(__dirname, '../../static')));

// API Routes
app.use('/api', publicRoutes);
app.use('/api', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// In production, serve the React build
if (process.env.NODE_ENV === 'production') {
  // __dirname = server/dist/ in prod, so ../../client/dist = project root/client/dist
  const clientDist = path.resolve(__dirname, '../../client/dist');

  // Cache du statut maintenance (rechargé toutes les 30s)
  const maintenanceCache = { value: false, lastCheck: 0 };

  async function isMaintenanceMode(): Promise<boolean> {
    const now = Date.now();
    if (now - maintenanceCache.lastCheck > 30000) {
      try {
        const result = await pool.query('SELECT maintenance_mode FROM profile LIMIT 1');
        maintenanceCache.value = result.rows[0]?.maintenance_mode ?? false;
        maintenanceCache.lastCheck = now;
      } catch { /* ignore, use cached value */ }
    }
    return maintenanceCache.value;
  }

  // Maintenance middleware — runs before static React files
  app.use(async (req, res, next) => {
    // Pass through API, uploads, static media, and any file with an extension
    // (Vite JS/CSS chunks live under /assets/, plus favicons, manifests, etc.)
    if (
      req.path.startsWith('/api') ||
      req.path.startsWith('/uploads') ||
      req.path.startsWith('/static') ||
      req.path.startsWith('/assets') ||
      /\.\w{1,6}$/.test(req.path)
    ) {
      return next();
    }

    const maintenance = await isMaintenanceMode();
    if (!maintenance) return next();

    // Check for admin JWT in Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (token) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const jwt = require('jsonwebtoken');
        jwt.verify(token, process.env.JWT_SECRET || 'secret');
        return next(); // Admin is authenticated — show the real site
      } catch { /* invalid token, fall through to maintenance page */ }
    }

    // Serve the React app — MaintenancePage component handles the display
    res.sendFile(path.join(clientDist, 'index.html'));
  });

  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
