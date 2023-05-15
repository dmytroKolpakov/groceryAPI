import * as mongoose from 'mongoose';
import { genderEnum } from '../enums/gender.enum';
import { rolesEnum } from '../enums/roles.enum';

export const UserSchema = new mongoose.Schema({
  deviceId: { type: [String], required: true },
  email: { type: String, required: true },
  userName: { type: String, required: true },
  firstName: { type: String, default: '' },
  lastName: { type: String, default: ''},
  gender: { type: String, enam: Object.values(genderEnum), default: genderEnum.male },
  address: {
    country: { type: String, default: null },
    city: { type: String, default: null },
    address1: { type: String, default: null },
    address2: { type: String, default: null },
    postalCode: { type: String, default: null },
  },
  roles: { type: [String], enum: Object.values(rolesEnum), default: [rolesEnum.user] },
  phone: { type: String, default: null },
  password: { type: String, required: true },
});

UserSchema.index({ userName: 1, email: 1 }, { unique: true });
