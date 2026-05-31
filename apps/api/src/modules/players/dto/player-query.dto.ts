import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PlayerQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(38)
  gameweek?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  teamId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  positionId?: number;

  @IsOptional()
  @Type(() => Number)
  minOwnership?: number;

  @IsOptional()
  @Type(() => Number)
  maxOwnership?: number;

  // Price in tenths of millions (e.g. 65 = £6.5m)
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  minPoints?: number;

  @IsOptional()
  @IsString()
  search?: string;

  // a=available, d=doubtful, i=injured, s=suspended, u=unavailable, n=not in squad
  @IsOptional()
  @IsIn(['a', 'd', 'i', 's', 'u', 'n'])
  status?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number;
}
