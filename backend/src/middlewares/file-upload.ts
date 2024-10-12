import { Express, Request } from 'express';
import multer, { FileFilterCallback } from 'multer';
import { tempUploadDirFull, maxUploadFileSize, maxUploadFileNameSize } from '../config';

export const fileFilter = (
  _: Request,
  file: Express.Multer.File,
  callback: FileFilterCallback,
): void => {
  if (
    file.mimetype === 'image/png'
        || file.mimetype === 'image/jpg'
        || file.mimetype === 'image/svg+xml'
        || file.mimetype === 'image/gif'
        || file.mimetype === 'image/jpeg'
  ) {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

export const uploadMiddleware = multer({
  dest: tempUploadDirFull,
  limits: {
    fieldNameSize: maxUploadFileNameSize,
    fileSize: maxUploadFileSize,
  },
  fileFilter,
});
