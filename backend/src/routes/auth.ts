import { Router } from 'express';
import auth from '../middlewares/auth';
import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
} from '../controllers/auth';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/logout', logout);
router.get('/token', refreshAccessToken);
router.get('/user', auth, getCurrentUser);

export default router;
