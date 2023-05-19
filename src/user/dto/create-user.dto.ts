import { Matches, IsString, IsEmail, IsNotEmpty, IsEnum, IsOptional,  } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateAddressDto } from './create-address.dto';
import { genderEnum } from '../enums/gender.enum';
import { IListItemSignUp } from 'src/list/interfaces/list-item.interface';

export class CreateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  readonly list: Array<IListItemSignUp>;

  @ApiProperty()
  @IsString()
  // @IsNotEmpty()
  readonly deviceId: string;

  @ApiProperty()
  @IsEmail()
  readonly email: string;

  @ApiProperty()
  readonly userName: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly firstName:  string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  readonly lastName: string;

  @ApiProperty()
  // @IsNotEmpty()
  @IsOptional()
  @IsEnum(genderEnum)
  readonly gender: string;

  @IsOptional()
  @ApiPropertyOptional()
  readonly address: CreateAddressDto;

  readonly roles: Array<string>;
  readonly phone: string;

  @IsString()
  @IsNotEmpty()
  @Matches(
    /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/,
    { message: 'Weak password' },
  )
  @ApiProperty()
  readonly password: string;
}