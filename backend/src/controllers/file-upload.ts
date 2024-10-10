import { Request, Response, NextFunction } from 'express';
import { tempUploadDirFull, imageURLDir } from '../config';
import { forceDir } from '../utils';

const fs = require('fs').promises;
const path = require('path');

const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
  const { file } = req;
  if (!file) {
    return next(new Error('Нет файла или файл недопустимого типа/размера!'));
  }
  try {
    await forceDir(tempUploadDirFull);
    const newFileName = path.join(
      tempUploadDirFull,
      req.file!.filename + path.extname(req.file?.originalname),
    );
    await fs.rename(file.path, newFileName);
    return res.send({
      fileName: path.join(imageURLDir, path.basename(newFileName)),
      originalName: req.file?.originalname,
    });
  } catch (err) {
    return next(new Error((err as Error).message));
  }
};

export default uploadFile;
