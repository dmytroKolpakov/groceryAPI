import * as mongoose from 'mongoose';

export const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
});

ProductSchema.index({ title: 1 }, { unique: true });
