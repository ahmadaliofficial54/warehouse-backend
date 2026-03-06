import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ProductDocument = HydratedDocument<Product>;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  sku!: string;

  @Prop({ trim: true })
  size?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ required: true, min: 0 })
  avgCostPrice!: number;

  @Prop({ min: 0 })
  defaultSalePrice?: number;

  @Prop({ required: true, default: 0, min: 0 })
  currentQty!: number;

  @Prop({ default: 5, min: 0 })
  lowStockThreshold!: number;

  @Prop({ default: true })
  isActive!: boolean;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
