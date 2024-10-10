import { Router } from 'express';
import {
  createProduct, getProducts, deleteProduct, updateProduct,
} from '../controllers/product';
import { validateObjId } from '../middlewares/validations';
import auth from '../middlewares/auth';

const router = Router();
router.get('/', getProducts);
router.post('/', auth, createProduct);
router.delete('/:id', auth, validateObjId, deleteProduct);
router.patch('/:id', auth, validateObjId, updateProduct);

export default router;
