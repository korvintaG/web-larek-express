import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import BadRequestError from '../errors/bad-request-error';
import { validateOrderProduct } from '../models/product';

const createOrder = (req: Request, res: Response, next: NextFunction) => {
  const { total, items } = req.body;
  validateOrderProduct(items, total)
    .then((err) => {
      if (err) return next(new BadRequestError(err));
      return res.send({ id: faker.string.uuid(), total });
    })
    .catch((err) => next(new Error(err.message)));
};

export default createOrder;
