import { Document } from "mongoose";
import { IAddress } from "./address.interface";

export interface IUser extends Document {
  readonly accessToken?: string;
  readonly deviceId: string;
  readonly email: string;
  readonly userName: string;
  readonly firstName:  string;
  readonly lastName: string;
  readonly gender: string;
  readonly address: IAddress;
  readonly roles: Array<string>;
  readonly phone: string;
  readonly password: string;
};
