import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, Matches } from 'class-validator';

export class SignInDto {
  // @IsString()
  // @IsNotEmpty()
  @ApiProperty()
  deviceId: string;

  // @IsString()
  // @IsNotEmpty()
  // @IsEmail()
  @ApiProperty()
  email: string;

  // @IsString()
  // @IsNotEmpty()
  @ApiProperty()
  password: string;
};
