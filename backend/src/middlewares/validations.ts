import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';

export type Order = {
    items: string[];
    total: number;
    payment: 'card' | 'online';
    email: string;
    phone: string;
    address : string;
}

export const orderSchema = Joi.object({
  items: Joi.array().items(Joi.string()).min(1).required(),
  total: Joi.number().required(),
  payment: Joi.string().valid('card', 'online').required(),
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  address: Joi.string().required(),
});

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
