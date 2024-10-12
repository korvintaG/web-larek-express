import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { errors as celebrateErrors } from 'celebrate';
import productRoute from './routes/product';
import fileRoute from './routes/file-upload';
import {
  PORT, DB_ADDRESS, corsOptions, publicDirFull,
} from './config';
import order from './routes/order';
import authRoute from './routes/auth';
import { requestLogger, errorLogger } from './middlewares/logger';
import { errorHandler, routeNotFoundHandler } from './middlewares/error-handler';

const cookieParser = require('cookie-parser');

const app = express();
app.use(cors(corsOptions));
app.use(cookieParser());

mongoose.connect(DB_ADDRESS);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(publicDirFull)); // делаем доступной папку public для пользователей
app.use(requestLogger); // логгируем все запросы

app.use('/product', productRoute);
app.use('/order', order);
app.use('/auth', authRoute);
app.use('/upload', fileRoute);

app.use(celebrateErrors()); // валидации celebrate
app.use(errorLogger); // логи winston
app.use(routeNotFoundHandler); // раз сюда дошли, значит, маршрут не найден
app.use(errorHandler); // самописный обработчик ошибок

app.listen(PORT, () => {
  // вывод в консоль нужен, чтоб было видно старт сервера, и eslint неправильно делает что ругается
  /* eslint-disable no-console */
  console.log(`App listening on port ${PORT}`);
  /* eslint-enable no-console */
});
