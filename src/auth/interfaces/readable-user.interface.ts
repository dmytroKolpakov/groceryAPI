import { IAddress } from "src/user/interfaces/address.interface";

export interface IReadableUser {
  accessToken: string;
  refreshToken: string;
  readonly deviceId: string;
  readonly email: string;
  readonly userName: string;
  readonly firstName:  string;
  readonly lastName: string;
  readonly gender: string;
  readonly address: IAddress;
  readonly roles: Array<string>;
  readonly phone: string;
};
