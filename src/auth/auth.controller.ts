import { Controller, Post, Body, ValidationPipe, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { SignInDto } from './dto/sign-in.dto';
import { IReadableUser } from './interfaces/readable-user.interface';
import { AuthGuard } from '@nestjs/passport';
import { IRefreshResponse } from './interfaces/refresh-response.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/signUp')
  async signUp(@Body(new ValidationPipe()) createUserDto: CreateUserDto): Promise<IReadableUser> {
    return this.authService.signUp(createUserDto);
  };

  @Post('/signIn')
  async signIn(@Body(new ValidationPipe()) signInDto: SignInDto): Promise<IReadableUser> {
    return this.authService.signIn(signInDto);
  }

  @UseGuards(AuthGuard('jwt-refresh'))
  @Post('/refresh')
  async refreshToken(@Request() req: any): Promise<IRefreshResponse> {
    return this.authService.refreshAccessToken(req.user.refreshToken);
  }
}
