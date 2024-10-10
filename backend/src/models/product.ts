import { model, Schema } from 'mongoose';
import { forceFileDel } from '../utils';
import { imageDirFull } from '../config';

const path = require('path');

export interface Image {
  fileName: string;
  originalName: string;
}

interface IProduct {
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

/**
 * Валидация товарной части заказа
 * @param items - заказанные товары
 * @param total - сумма заказа
 * @returns undefined если все ок или текст ошибки валидации
 */
export async function validateOrderProduct(items: string[], total: number) {
  return Promise.all(items.map((item) => Product.findById(item)
    .then((product) => {
      if (product === null) return undefined;
      return product.price;
    })
    .catch(() => undefined)))
    .then((res) => {
      let totalCalc = 0;
      for (let i = 0; i < items.length; i += 1) {
        if (!res[i]) return `Товар с id ${items[i]} не найден`;
        if (res[i] === null) return `Товар с id ${items[i]} не продается!`;
        totalCalc += res[i]!;
      }
      if (totalCalc !== total) {
        return 'Неверная сумма заказа';
      }
      return undefined;
    })
    .catch((err) => err.message);
}

export default Product;
