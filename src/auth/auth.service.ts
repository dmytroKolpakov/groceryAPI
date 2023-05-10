import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/token/token.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { SignOptions } from 'jsonwebtoken';
import { CreateUserTokenDto } from 'src/token/dto/user-token.dto';
import { IUser } from 'src/user/interfaces/user.interface';
import { rolesEnum } from 'src/user/enums/roles.enum';
import * as moment from 'moment';
import * as _ from 'lodash';
import { ISignIn } from './interfaces/sign-in.interface';
import { IReadableUser } from './interfaces/readable-user.interface';
import { compare } from 'bcrypt';
import { ITokenPayload } from 'src/token/interfaces/token-payload.interface';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { IRefreshTokenPayload } from 'src/refresh-token/interfaces/refresh-token-payload.interface';
import { ObjectId } from 'mongodb';
import { CreateUserRefreshTokenDto } from 'src/refresh-token/dto/user-refresh-token.dto';
import { IRefreshResponse } from './interfaces/refresh-response.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
    private readonly refreshService: RefreshTokenService,
  ) {}

  async signUp(createUserDto: CreateUserDto): Promise<IReadableUser> {
    const user = await this.userService.create(createUserDto, [rolesEnum.user]);
    await user.save();
    return await this.processUserAuth(user);
  };

  async signIn(signInDto: ISignIn): Promise<IReadableUser> {
    const user = await this.userService.findByEmail(signInDto.email);
    if (user && (await compare(signInDto.password, user.password))) {
      return await this.processUserAuth(user);
    }

    throw new BadRequestException('Invalid credentials');
  };

  private async processUserAuth(user: IUser): Promise<IReadableUser> {
    const tokenPayload: ITokenPayload = {
      _id: user._id,
      roles: user.roles,
    };
    const token = await this.generateToken(tokenPayload);
    const expireAt = moment()
      .add(10, 'day')
      .toISOString();
    await this.saveToken({
      token,
      expireAt,
      uId: user._id,
    });

    const refreshToken = await this.generateRefreshToken(tokenPayload);
    const expireAtRefresh = moment()
      .add(90, 'day')
      .toISOString();
    await this.saveRefreshToken({
      token: refreshToken,
      expireAt: expireAtRefresh,
      uId: user._id,
    });


    const readableUser = user.toObject() as IReadableUser;
    readableUser.accessToken = token;
    readableUser.refreshToken = refreshToken;

    return _.omit<any>(readableUser, ['password']) as IReadableUser;
  };

  async refreshAccessToken(refreshToken: string): Promise<IRefreshResponse> {
    const refreshTokenData = await this.verifyRefreshToken(refreshToken);
    const tokenPayload: ITokenPayload = {
      _id: refreshTokenData._id,
      roles: refreshTokenData.roles,
    };
    const newAccessToken = await this.generateToken(tokenPayload);
    const expireAt = moment()
      .add(10, 'day')
      .toISOString();
      await this.saveToken({
        token: newAccessToken,
        expireAt,
        uId: refreshTokenData._id,
      });

      return { accessToken: newAccessToken };
  };

  private async generateToken(data, options?: SignOptions) : Promise<string> {
    return this.jwtService.sign(data, { secret: process.env.JWT_SECRET })
  };

  private async generateRefreshToken(data, options?: any) : Promise<string> {
    return this.jwtService.signAsync(data, { secret: process.env.JWT_REFRESH_SECRET })
  };

  private async verifyRefreshToken(token: string): Promise<IRefreshTokenPayload> {
    try {
      const data = await this.jwtService.verifyAsync(token, { secret: process.env.JWT_REFRESH_SECRET }) as IRefreshTokenPayload;
      const tokenExists = await this.refreshService.exists(data?._id, token);
      const isValidDate = await this.refreshService.isValidDate(data?._id, token);
      if (tokenExists && isValidDate)
        return data;

      throw new UnauthorizedException();
    } catch (e) {
      throw new UnauthorizedException();
    }
  };

  private async verifyToken(token: string): Promise<any> {
    try {
      const data = this.jwtService.verify(token) as ITokenPayload;
      const tokenExists = await this.tokenService.exists(data?._id, token);

      if (tokenExists)
        return data;

      throw new UnauthorizedException();
    } catch (e) {
      throw new UnauthorizedException();
    }
  };

  private async saveToken(createUserTokenDto: CreateUserTokenDto) {
    const userToken = await this.tokenService.create(createUserTokenDto);

    return userToken;
  };

  private async saveRefreshToken(createUserRefreshTokenDto: CreateUserRefreshTokenDto) {
    const userRefreshToken = await this.refreshService.create(createUserRefreshTokenDto);

    return userRefreshToken;

  }
};
