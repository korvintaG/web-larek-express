import { model, Schema } from 'mongoose';
import { forceFileDel } from '../utils';
import { imageDirFull } from '../config';

const path = require('path');

export interface Image {
  fileName: string;
  originalName: string;
}

export interface IProduct {
  title: string;
  category: string;
  description: string;
  price: number;
  image: Image;
}

const imageSchema = new Schema<Image>({
  fileName: {
    type: String,
    required: [true, 'Поле "fileName" должно быть заполнено'],
  },
  originalName: {
    type: String,
    required: [true, 'Поле "originalName" должно быть заполнено'],
  },
});

const productSchema = new Schema<IProduct>({
  title: {
    type: String,
    required: [true, 'Поле "title" должно быть заполнено'],
    unique: true,
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
  },
  image: {
    type: imageSchema,
    required: [true, 'Поле "image" должно быть заполнено'],
  },
  category: {
    type: String,
    required: [true, 'Поле "category" должно быть заполнено'],
  },
  description: String,
  price: {
    type: Number,
    default: null,
  },
});

/**
 * Триггер на удаление изображения при удалении карточки продукта
 */
productSchema.post('findOneAndDelete', (doc) => {
  const fileToDel = path.join(imageDirFull, path.basename(doc.image.fileName));
  forceFileDel(fileToDel);
});

const Product = model<IProduct>('product', productSchema); // основная модель

export default Product;
