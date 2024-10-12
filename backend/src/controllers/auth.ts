import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // импортируем bcrypt
import ms from 'ms';
import User, { IUserID } from '../models/user';
import ConflictError from '../errors/conflict-error';
import UnauthorizedError from '../errors/unauthorized';
import BadRequestError from '../errors/bad-request-error';
import {
  secretAccess,
  secretRefresh,
  AUTH_REFRESH_TOKEN_EXPIRY,
  AUTH_ACCESS_TOKEN_EXPIRY,
} from '../config';
import NotFoundError from '../errors/not-found-error';

export interface IPayloadToken {
  _id: string;
}

/**
 * Формирует пару токенов по user.id
 * @param userID - ID пользователя
 * @returns объект пользователя с токенами или undefined если пользователь не найден
 */
async function formTokens(userID: string) {
  const accessToken = jwt.sign({ _id: userID }, secretAccess, {
    expiresIn: AUTH_ACCESS_TOKEN_EXPIRY,
  });
  const refreshToken = jwt.sign({ _id: userID }, secretRefresh, {
    expiresIn: AUTH_REFRESH_TOKEN_EXPIRY,
  });
  const user = await User.findById(userID).select('+tokens');
  if (!user) {
    return undefined;
  }

  let upUser: IUserID | null;
  if (user && user.tokens) {
    upUser = await User.findByIdAndUpdate(userID, {
      tokens: [...user.tokens, { token: refreshToken }],
    });
  } else {
    upUser = await User.findByIdAndUpdate(userID, {
      tokens: [{ token: refreshToken }],
    });
  }
  return {
    user: { email: upUser!.email, name: upUser!.name },
    accessToken,
    refreshToken,
  };
}

/**
 * отсылает результат авторизации - пользователь + токены
 * @param res - Response
 * @param userEmail - email пользователя
 * @param userName - имя пользователя
 * @param refreshToken
 * @param accessToken
 */
const sendAuthAnswer = (
  res: Response,
  userEmail: string | undefined,
  userName: string | undefined,
  refreshToken: string,
  accessToken: string,
) => {
  res.cookie('REFRESH_TOKEN', refreshToken, {
    sameSite: 'lax',
    secure: true,
    httpOnly: true,
    maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY),
    path: '/',
  });
  res.send({
    user: { email: userEmail, name: userName },
    success: true,
    accessToken,
  });
};

/**
 * функция регистрации пользователя
 * @param req
 * @param res
 * @param next
 */
export const register = (req: Request, res: Response, next: NextFunction) => {
  bcrypt.hash(req.body.password, 10).then((hash) => User.create({
    name: req.body.name,
    email: req.body.email,
    password: hash,
  })
    .then((user) => {
      formTokens(String(user._id)).then((tokens) => {
        if (!tokens) {
          return next(
            new NotFoundError(
              'Пользователь по заданному id отсутствует в базе',
            ),
          );
        }
        return sendAuthAnswer(
          res,
              user!.email,
              user?.name,
              tokens.refreshToken,
              tokens.accessToken,
        );
      });
    })
    .catch((err) => {
      if (err instanceof Error && err.message.includes('E11000')) {
        return next(new ConflictError(err.message));
      }
      if (
        err instanceof Error
          && err.message.includes('Некорректный email!')
      ) { return next(new BadRequestError(err.message)); }
      return next(err);
    }));
};

export const login = (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      formTokens(String(user._id)).then((tokens) => {
        if (!tokens) {
          return next(
            new NotFoundError('Пользователь по заданному id отсутствует в базе'),
          );
        }
        return sendAuthAnswer(
          res,
            user!.email,
            user?.name,
            tokens.refreshToken,
            tokens.accessToken,
        );
      });
    })
    .catch((err) => {
      // ошибка аутентификации
      if (err instanceof UnauthorizedError) {
        return next(new UnauthorizedError(err.message));
      }
      return next(err);
    });
};

/**
 * обновление AccessToken
 * @param req
 * @param res
 * @param next
 */
export const refreshAccessToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const refreshToken = req.cookies.REFRESH_TOKEN;
  if (!refreshToken) {
    return next(new UnauthorizedError('Ошибка аутентификации'));
  }
  try {
    const payload = jwt.verify(refreshToken, secretRefresh) as IPayloadToken;
    return formTokens(payload._id).then((data) => {
      if (!data) {
        return next(
          new NotFoundError('Пользователь по заданному id отсутствует в базе'),
        );
      }
      return sendAuthAnswer(
        res,
        data.user.email,
        data.user.name,
        data.refreshToken,
        data.accessToken,
      );
    });
  } catch (err) {
    // отправим ошибку, если не получилось
    return next(new UnauthorizedError('Переданный токен просрочен или инвалиден'));
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.REFRESH_TOKEN;
  if (!refreshToken) {
    return next(new UnauthorizedError('Ошибка аутентификации'));
  }
  try {
    const payload = jwt.verify(refreshToken, secretRefresh) as IPayloadToken;
    return User.findById(payload._id)
      .select('+tokens')
      .then((user) => {
        if (!user) {
          return next(new NotFoundError('Пользователь не найден!'));
        }
        return User.findByIdAndUpdate(payload._id, {
          tokens: user!.tokens.filter((el) => el.token !== refreshToken),
        })
          .then((_) => {
            res.cookie('REFRESH_TOKEN', refreshToken, {
              sameSite: 'lax',
              secure: true,
              httpOnly: true,
              maxAge: 0,
              path: '/',
            });
            res.send({ success: true });
          })
          .catch(next);
      })
      .catch((err) => next(new NotFoundError(err.message)));
  } catch (err) {
    // отправим ошибку, если не получилось
    return next(new UnauthorizedError('Переданный токен просрочен или инвалиден'));
  }
};

export const getCurrentUser = (
  req: Request,
  res: Response,
  next: NextFunction,
) => User.findById(req.user!.id!)
  .then((user) => {
    if (!user) {
      return next(
        new NotFoundError(
          'Пользователь по заданному id отсутствует в базе!',
        ),
      );
    }
    return res.send({
      user: {
        email: user!.email,
        name: user?.name,
      },
      success: true,
    });
  })
  .catch(next);
