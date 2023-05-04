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

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
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

    const readableUser = user.toObject() as IReadableUser;
    readableUser.accessToken = token;

    return _.omit<any>(readableUser, ['password']) as IReadableUser;
}

  private async generateToken(data, options?: SignOptions) : Promise<string> {
    return this.jwtService.sign(data, options)
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
  }
};
