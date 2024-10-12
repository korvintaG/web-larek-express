import { Request, Response } from 'express';
import { faker } from '@faker-js/faker';

const createOrder = (
  req: Request,
  res: Response,
) => res.send({ id: faker.string.uuid(), total: req.body.total });

export default createOrder;
