import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class StockOutDto {
  @ApiProperty()
  @IsString()
  productId!: string;

  @ApiProperty({ minimum: 1 })
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(1)
  qty!: number;

  @ApiProperty({ minimum: 0 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  salePrice!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
}
