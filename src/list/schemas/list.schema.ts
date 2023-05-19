import * as mongoose from 'mongoose';
import { statusEnum } from '../enums/status.enum';

export const ListSchema = new mongoose.Schema({
  uId: { type: mongoose.Types.ObjectId },
  status: { type: String, required: true, default: statusEnum.cart },
  productId: { type: mongoose.Types.ObjectId, required: true },
});
