import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from 'src/user/user.module';
import { configureModule } from 'src/configure.root';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { TokenModule } from 'src/token/token.module';
import { JwtStrategy } from './jwt.strategy';
import { RefreshTokenStrategy } from './refresh.strategy';
import { RefreshTokenModule } from 'src/refresh-token/refresh-token.module';

@Module({
  imports: [
    UserModule,
    TokenModule,
    RefreshTokenModule,
    configureModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      // secret: process.env.JWT_SECRET,
      // signOptions: { expiresIn: '10d' },
    })
  ],
  providers: [AuthService, JwtStrategy, RefreshTokenStrategy],
  controllers: [AuthController]
})
export class AuthModule {}

