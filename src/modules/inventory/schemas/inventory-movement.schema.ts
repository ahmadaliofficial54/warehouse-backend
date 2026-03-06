import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type InventoryMovementDocument = HydratedDocument<InventoryMovement>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class InventoryMovement {
  @Prop({ required: true, enum: ['IN', 'OUT'] })
  type!: 'IN' | 'OUT';

  @Prop({ required: true, type: Types.ObjectId, ref: 'Product' })
  productId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  qty!: number;

  @Prop({ min: 0 })
  costPrice?: number;

  @Prop({ min: 0 })
  salePrice?: number;

  @Prop()
  profitOrLoss?: number;

  @Prop({ required: true, enum: ['single', 'bulk'] })
  source!: 'single' | 'bulk';

  @Prop()
  note?: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy!: Types.ObjectId;
}

export const InventoryMovementSchema = SchemaFactory.createForClass(InventoryMovement);
