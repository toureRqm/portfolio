import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp|pdf/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

export function createCvUpload(lang: 'en' | 'fr') {
  const dir = path.resolve(process.env.UPLOAD_DIR || './uploads', 'cv', lang);
  fs.mkdirSync(dir, { recursive: true });
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, dir),
      filename: (_req, _file, cb) => cb(null, 'cv.pdf'),
    }),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
      cb(null, path.extname(file.originalname).toLowerCase() === '.pdf');
    },
  }).single('cv');
}
