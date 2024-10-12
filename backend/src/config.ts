import 'dotenv/config';

const path = require('path');

export const {
  PORT = 3000,
  DB_ADDRESS = 'mongodb://127.0.0.1:27017/weblarek',
  UPLOAD_PATH = 'images',
  UPLOAD_PATH_TEMP = 'temp',
  AUTH_REFRESH_TOKEN_EXPIRY = '7d',
  AUTH_ACCESS_TOKEN_EXPIRY = '10m',
  ORIGIN_ALLOW = 'http://localhost:5173',
} = process.env;

const publicDirName = 'public';

export const corsOptions = {
  origin: ORIGIN_ALLOW,
  credentials: true,
};

export const secretAccess = 'some-secret-access-key';
export const secretRefresh = 'some-secret-refresh-key';

export const maxUploadFileSize = 1048576;
export const maxUploadFileNameSize = 300;

export const publicDirFull = path.join(__dirname, publicDirName);
export const tempURLDir = `/${UPLOAD_PATH_TEMP}`;
export const tempUploadDir = path.join(`./${publicDirName}`, tempURLDir);
export const tempUploadDirFull = path.join(__dirname, tempUploadDir);
export const imageURLDir = `/${UPLOAD_PATH}`;
export const imageDir = path.join(`./${publicDirName}`, imageURLDir);
export const imageDirFull = path.join(__dirname, imageDir);
