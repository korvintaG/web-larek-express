import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import createOrder from '../controllers/order';
import { orderSchema, validateOrderProduct } from '../middlewares/validations';

const router = Router();
const validateOrder = celebrate({
  [Segments.BODY]: orderSchema,
});

router.post('/', validateOrder, validateOrderProduct, createOrder);

export default router;
