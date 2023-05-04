import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as _ from 'lodash';
import { IUser } from './interfaces/user.interface';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(@InjectModel('User') private readonly userModel: Model<IUser>) {}

  async create(createUserDro: CreateUserDto, roless: string[]): Promise<IUser> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(createUserDro.password, salt);

    const userByEmail = await this.findByEmail(createUserDro.email);
    const userByUserName = await this.findByUserName(createUserDro.userName);

    if (userByEmail || userByUserName)
      throw new HttpException(
        `${userByEmail ? 'Email' : 'Username'} already exists.`,
        HttpStatus.BAD_REQUEST
        );

    const createdUser = new this.userModel(_.assignIn(createUserDro, { password: hash, roless }));
    return await createdUser.save();
  };

  async validatePassword(cryptedPassword: string, passwordString: string): Promise<boolean> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(passwordString, salt);

    return hash === cryptedPassword;
  }

  async find(id: string): Promise<IUser> {
    return await this.userModel.findById(id).exec();
  };

  async findByEmail(email: string): Promise<IUser> {
    return await this.userModel.findOne({ email }).exec();
  };

  async findByUserName(userName: string): Promise<IUser> {
    return await this.userModel.findOne({ userName }).exec();
  };

  async update(id: string, payload: Partial<IUser>) {
    return await this.userModel.updateOne({ _id: id }, payload).exec();
  }
};
