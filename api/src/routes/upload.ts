import { Router } from 'express';
import multer from 'multer';
import { requireAuth, requireCatalogEditor } from '../utils/auth';
import { uploadProductImage } from '../services/r2.service';

const router = Router();
const allowedMimeTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif']);
const maxFileSize = 5 * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxFileSize },
  fileFilter: (_req, file, callback) => {
    callback(null, allowedMimeTypes.has(file.mimetype));
  },
});

router.post('/', requireAuth, requireCatalogEditor, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    if (typeof req.body.productSku !== 'string' || !req.body.productSku.trim()) {
      return res.status(400).json({ error: 'Product SKU is required' });
    }

    const url = await uploadProductImage(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname,
      req.body.productSku,
    );
    return res.status(201).json({ url });
  } catch (error) {
    return next(error);
  }
});

router.use((error: unknown, _req: import('express').Request, res: import('express').Response, next: import('express').NextFunction) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Image exceeds the 5 MB limit' });
    }
    return res.status(400).json({ error: 'Invalid image upload' });
  }
  if (error instanceof Error && error.message.startsWith('Unsupported image')) {
    return res.status(415).json({ error: error.message });
  }
  return next(error);
});

export default router;
