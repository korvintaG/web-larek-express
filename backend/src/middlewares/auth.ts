import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IPayloadToken } from '../controllers/auth';
import { secretAccess } from '../config';
import UnauthorizedError from '../errors/unauthorized';

const errorAuthName = 'Необходима авторизация';
const authStringBegin = 'Bearer ';

export default (req: Request, _: Response, next: NextFunction) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith(authStringBegin)) {
    return next(new UnauthorizedError(errorAuthName));
  }
  const token = authorization.replace(authStringBegin, '');
  let payload;

  try {
    payload = jwt.verify(token, secretAccess) as IPayloadToken;
  } catch (err) {
    return next(new UnauthorizedError(errorAuthName));
  }
  if (payload && payload._id) {
    req.user = { id: payload._id }; // записываем _id
    return next(); // пропускаем запрос дальше
  }
  return next(new UnauthorizedError(errorAuthName));
};
