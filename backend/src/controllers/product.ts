import { Request, Response, NextFunction } from 'express';
import { constants } from 'fs';
import fs from 'fs/promises';

import Product, { Image } from '../models/product';
import ConflictError from '../errors/conflict-error';
import { tempUploadDirFull, imageDirFull, imageURLDir } from '../config';
import BadRequestError from '../errors/bad-request-error';

const path = require('path');

/**
 * переименовываем файл если нужно
 * @param image - объект изображения
 * @returns новый вариант объекта изображения
 */
async function renameUpload(image:Image) {
  if (image) {
    try {
      const curFileName = path.join(tempUploadDirFull, path.basename(image.fileName));
      await fs.access(curFileName, constants.F_OK);
      const newFileName = path.join(imageDirFull, path.basename(image.fileName));
      await fs.rename(curFileName, newFileName);
      return ({
        fileName: path.join(imageURLDir, path.basename(image.fileName)),
        originalName: image.originalName,
      });
    } catch { return (image); }
  } else { return (undefined); }
}

export const createProduct = (req: Request, res: Response, next: NextFunction) => {
  const {
    title, category, description, price, image,
  } = req.body;

  return renameUpload(image)
    .then((newImage) => Product.create({
      title, category, description, price, image: newImage,
    })
      .then((product) => res.send(product))
      .catch((err) => {
        if (err instanceof Error && err.message.includes('E11000')) {
          return next(new ConflictError(err.message));
        }
        return next(new BadRequestError(err.message));
      })
      .catch(() => next(new Error('Не получается переместить загруженный файл в постоянное место хранения'))));
};

export function getProducts(_: Request, res: Response, next: NextFunction) {
  return Product.find({})
    .then((products) => res.send({ items: products, total: products.length }))
    .catch((err) => next(new Error(err.message)));
}

export const deleteProduct = (req: Request, res: Response, next: NextFunction) => {
  if (req.params.id) {
    return Product.findByIdAndDelete(req.params.id)
      .then((product) => {
        if (product) { return res.send(product); }
        return next(new Error('Передан не валидный ID товара'));
      })
      .catch((err) => next(new BadRequestError(err.message)));
  }
  return (next(new Error('Пустой параметр запроса')));
};

export const updateProduct = (req: Request, res: Response, next: NextFunction) => {
  if (req.body.image) {
    return renameUpload(req.body.image)
      .then((newImage) => {
        let upBody = req.body;
        if (newImage) upBody = { ...req.body, image: newImage };
        return Product.findByIdAndUpdate(req.params.id, upBody, { new: true })
          .then((product) => res.send(product))
          .catch((err) => {
            if (err instanceof Error && err.message.includes('E11000')) {
              return next(new ConflictError(err.message));
            }
            return next(new BadRequestError(err.message));
          });
      })
      .catch(() => next(new Error('Не получается переместить загруженный файл в постоянное место хранения')));
  }
  return Product.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .then((product) => res.send(product))
    .catch((err) => next(new BadRequestError(err.message)));
};
