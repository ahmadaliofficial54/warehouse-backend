import { IsEnum } from 'class-validator';

export class BulkUploadQueryDto {
  @IsEnum(['PRODUCT_IMPORT', 'STOCK_IN_BULK', 'STOCK_OUT_BULK'])
  type!: 'PRODUCT_IMPORT' | 'STOCK_IN_BULK' | 'STOCK_OUT_BULK';
}
