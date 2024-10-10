import { Request, Response, NextFunction } from 'express';
import NotFoundError from '../errors/not-found-error';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  let errorCode = 500; // по умолчанию
  if (err.statusCode) { errorCode = err.statusCode; }
  res.status(errorCode).send({ message: err.message });
}

export const routeNotFoundHandler = (
  _req: Request,
  _res: Response,
  next: NextFunction,
) => next(new NotFoundError('Маршрут не найден'));
