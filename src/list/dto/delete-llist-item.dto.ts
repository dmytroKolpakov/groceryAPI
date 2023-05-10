import { IsString, IsNotEmpty, } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import * as mongoose from 'mongoose';

export class DeleteListItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  readonly _id: mongoose.Types.ObjectId;
};
