const winston = require('winston');

const {
  combine, timestamp, splat, json,
} = winston.format;
const expressWinston = require('express-winston');

export const requestLogger = expressWinston.logger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    splat(),
    json(),
  ),
  transports: [
    new winston.transports.File({ filename: './logs/request.log' }),
  ],
});

// логгер ошибок
export const errorLogger = expressWinston.errorLogger({
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    splat(),
    json(),
  ),
  transports: [
    new winston.transports.File({ filename: './logs/error.log' }),
  ],
});

expressWinston.requestWhitelist.push('body'); // чтоб и тело запроса логгировало !!! Для безопасности в продакшн отключить
