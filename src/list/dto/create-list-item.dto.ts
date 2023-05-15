import { IsString, IsNotEmpty, IsEnum, IsOptional,  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { statusEnum } from '../enums/status.enum';

export class CreateListItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly title: string;

  @ApiProperty()
  @IsString()
  @IsEnum(statusEnum)
  @IsOptional()
  readonly status?: string
};
