import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import auth from '../middlewares/auth';
import { userSchema } from '../middlewares/validations';

import {
  register,
  login,
  logout,
  refreshAccessToken,
  getCurrentUser,
} from '../controllers/auth';

const validateUser = celebrate({
  [Segments.BODY]: userSchema,
});

const router = Router();
router.post('/register', validateUser, register);
router.post('/login', validateUser, login);
router.get('/logout', logout);
router.get('/token', refreshAccessToken);
router.get('/user', auth, getCurrentUser);

export default router;
