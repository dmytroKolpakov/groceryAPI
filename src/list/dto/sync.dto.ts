import { IsString, IsNotEmpty, IsOptional,  } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SyncListDto } from './sync-list.dto';

export class SyncDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly list: Array<SyncListDto>;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  readonly excludeId?: string;
};
