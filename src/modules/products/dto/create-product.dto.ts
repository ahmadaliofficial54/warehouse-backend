import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Classic T-Shirt' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'TSHIRT-001' })
  @IsString()
  sku!: string;

  @ApiPropertyOptional({ example: 'M' })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/tshirt.png' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 12.5 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  avgCostPrice!: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  defaultSalePrice?: number;

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 0 })
  @Min(0)
  lowStockThreshold?: number;
}
