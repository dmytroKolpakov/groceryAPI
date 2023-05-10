import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRefreshToken } from './interfaces/user-refresh-token.interfaces';
import { CreateUserRefreshTokenDto } from './dto/user-refresh-token.dto';
import { DeleteResult } from 'mongodb';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectModel('RefreshToken') private readonly refreshTokenModel: Model<IUserRefreshToken>
  ) { }

  async create(createUserTokenDto: CreateUserRefreshTokenDto): Promise<IUserRefreshToken> {
    const userToken = new this.refreshTokenModel(createUserTokenDto);
    return await userToken.save();
  };

  async delete(uId: string, token: string): Promise<DeleteResult> {
    return await this.refreshTokenModel.deleteOne({ uId, token });
  };

  async deleteAll(uId: string): Promise<DeleteResult> {
    return await this.refreshTokenModel.deleteMany({ uId });
  };

  async exists(uId: string, token: string): Promise<boolean> {
    const documents = await this.refreshTokenModel.exists({ uId, token });
    return !!documents;
  };

  async isValidDate(uId: string, token: string): Promise<boolean> {
    const documents = await this.refreshTokenModel.exists({ uId, token });
    const rT = await this.refreshTokenModel.findById(documents._id);
    return new Date().getTime() < new Date(rT.expireAt).getTime();
  }
}
