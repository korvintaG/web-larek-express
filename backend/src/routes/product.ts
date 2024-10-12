import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import {
  createProduct, getProducts, deleteProduct, updateProduct,
} from '../controllers/product';
import { validateObjId, productSchema, productUpdateSchema } from '../middlewares/validations';
import auth from '../middlewares/auth';

const validateProduct = celebrate({
  [Segments.BODY]: productSchema,
});

const validateUpdateProduct = celebrate({
  [Segments.BODY]: productUpdateSchema,
});

const router = Router();
router.get('/', getProducts);
router.post('/', auth, validateProduct, createProduct);
router.delete('/:id', auth, validateObjId, deleteProduct);
router.patch('/:id', auth, validateObjId, validateUpdateProduct, updateProduct);

export default router;
