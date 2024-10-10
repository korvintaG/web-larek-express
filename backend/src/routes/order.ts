import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import createOrder from '../controllers/order';
import { orderSchema } from '../middlewares/validations';

const router = Router();
const orderRouteValidator = celebrate({
  [Segments.BODY]: orderSchema,
});

router.post('/', orderRouteValidator, createOrder);

export default router;
