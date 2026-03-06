import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, ValidateNested } from 'class-validator';
import { StockInDto } from './stock-in.dto';
import { StockOutDto } from './stock-out.dto';

export class BulkStockInDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockInDto)
  rows!: StockInDto[];
}

export class BulkStockOutDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => StockOutDto)
  rows!: StockOutDto[];
}
