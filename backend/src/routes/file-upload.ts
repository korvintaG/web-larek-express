import { Router } from 'express';
import uploadFile from '../controllers/file-upload';
import { uploadMiddleware } from '../middlewares/file-upload';
import auth from '../middlewares/auth';

const router = Router();
router.post('/', auth, uploadMiddleware.single('file'), uploadFile);

export default router;
