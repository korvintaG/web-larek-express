import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';

export const orderSchema = Joi.object({
  items: Joi.array().items(Joi.string()).min(1).required(),
  total: Joi.number().required(),
  payment: Joi.string().valid('card', 'online').required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
});

export const userSchema = Joi.object({
  name: Joi.string().required().min(2).max(30),
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6),
});

// схема валидации товара на добавление
export const productSchema = Joi.object({
  title: Joi.string().required().min(2).max(30),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).required(),
  category: Joi.string().required(),
  description: Joi.string(),
  price: Joi.number().allow(null),
});

// схема валидации товара на patch
export const productUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(30),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }),
  category: Joi.string(),
  description: Joi.string(),
  price: Joi.number().allow(null),
});

// валидация _id продукта
export const validateObjId = (
  req: Request,
  _res:Response,
  next: NextFunction,
) => Product.findById(req.params.id)
  .then((product) => {
    if (product) return next();
    return next(new NotFoundError('товар с переданным _id не найден'));
  })
  .catch(() => next(new BadRequestError('Переданный _id товара невалиден')));

// валидация товарного блока заказа
export async function validateOrderProduct(req: Request, _res: Response, next: NextFunction) {
  const { total, items } = req.body;
  return Promise.all((items as string[]).map((item) => Product.findById(item)
    .then((product) => {
      if (product === null) return null;
      if (product.price === null) return Infinity;
      return product.price;
    })
    .catch(() => undefined)))
    .then((prices) => {
      let totalCalc = 0;
      for (let i = 0; i < items.length; i += 1) {
        if (prices[i] === null) return next(new BadRequestError(`Товар с id ${items[i]} не найден`));
        if (!prices[i]) return next(new BadRequestError(`Передан не валидный ID товара ${items[i]}`));
        if (prices[i] === Infinity) return next(new BadRequestError(`Товар с id ${items[i]} не продается!`));
        totalCalc += prices[i]!;
      }
      if (totalCalc !== total) {
        return next(new BadRequestError('Неверная сумма заказа'));
      }
      return next();
    })
    .catch(next);
}
