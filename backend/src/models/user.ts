import { Model, model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs'; // импортируем bcrypt
import { isEmail } from 'validator';
import UnauthorizedError from '../errors/unauthorized';
import BadRequestError from '../errors/bad-request-error';

export interface IToken {
  token: string;
}

const tokenSchema = new Schema<IToken>({
  token: {
    type: String,
  },
});

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: IToken[];
}

export type IUserID = IUser & { _id: string };

interface UserModel extends Model<IUser> {
  findUserByCredentials: (email: string, password: string) => Promise<IUserID>;
}

function validateEmail(email: string) {
  if (!isEmail(email)) {
    return Promise.reject(new BadRequestError('Некорректный email!'));
  }
  return Promise.resolve(true);
}

const userSchema = new Schema<IUser, UserModel>({
  name: {
    type: String,
    minlength: [2, 'Минимальная длина поля "name" - 2'],
    maxlength: [30, 'Максимальная длина поля "name" - 30'],
    default: 'Ё-мое',
  },
  email: {
    type: String,
    required: [true, 'Поле "email" должно быть заполнено'],
    validate: {
      validator: validateEmail,
    },
    unique: true,
  },
  password: {
    type: String,
    select: false,
    required: [true, 'Поле "password" должно быть заполнено'],
    minlength: [6, 'Минимальная длина поля "password" - 6'],
  },
  tokens: {
    type: [tokenSchema],
    select: false,
  },
});

userSchema.static(
  'findUserByCredentials',
  function findUserByCredentials(email: string, password: string) {
    return this.findOne({ email })
      .select('+password')
      .then((user) => {
        if (!user) {
          return Promise.reject(
            new UnauthorizedError('Неправильная почта или пароль'),
          );
        }

        return bcrypt.compare(password, user.password).then((matched) => {
          if (!matched) {
            return Promise.reject(
              new UnauthorizedError('Неправильная почта или пароль'),
            );
          }
          return user; // теперь user доступен
        });
      });
  },
);

// описываем модель: первый параметр - имя коллекции БД, второй - схема данных
export default model<IUser, UserModel>('user', userSchema);
