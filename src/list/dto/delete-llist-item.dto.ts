import { IsString, IsNotEmpty, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteListItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly _id: string;
};
