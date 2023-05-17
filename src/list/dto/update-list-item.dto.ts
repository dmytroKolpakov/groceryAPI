import { IsString, IsNotEmpty, IsEnum, IsOptional,  } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { statusEnum } from '../enums/status.enum';

export class UpdateListItemDto {
  @ApiProperty()
  @IsString()
  @IsEnum(statusEnum)
  @IsNotEmpty()
  readonly status: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly _id: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  readonly excludeId: string;
};
