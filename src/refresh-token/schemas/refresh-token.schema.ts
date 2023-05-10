import * as mongoose from 'mongoose';

export const RefreshTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  uId: { type: mongoose.Types.ObjectId, required: true, ref: 'User' },
  expireAt: { type: Date, required: true },
});

RefreshTokenSchema.index({ token: 1, uId: 1 }, { unique: true });
