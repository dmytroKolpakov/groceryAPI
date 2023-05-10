import { Date, Document } from 'mongoose';

export interface IUserRefreshToken extends Document {
  readonly token: string;
  readonly uId: string;
  readonly expireAt: string;
};
