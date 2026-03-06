import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BulkJobDocument = HydratedDocument<BulkJob>;

@Schema({ timestamps: true })
export class BulkJob {
  @Prop({ required: true, enum: ['PRODUCT_IMPORT', 'STOCK_IN_BULK', 'STOCK_OUT_BULK'] })
  type!: 'PRODUCT_IMPORT' | 'STOCK_IN_BULK' | 'STOCK_OUT_BULK';

  @Prop({ required: true, enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'], default: 'PENDING' })
  status!: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

  @Prop({ default: 0 })
  totalRows!: number;

  @Prop({ default: 0 })
  successRows!: number;

  @Prop({ default: 0 })
  failedRows!: number;

  @Prop({ type: [{ message: String, row: Number }], default: [] })
  errors!: { message: string; row: number }[];
}

export const BulkJobSchema = SchemaFactory.createForClass(BulkJob);
