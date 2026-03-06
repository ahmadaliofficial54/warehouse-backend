import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, PipelineStage, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product, ProductDocument } from './schemas/product.schema';

@Injectable()
export class ProductsService {
  constructor(@InjectModel(Product.name) private readonly productModel: Model<ProductDocument>) {}

  async create(dto: CreateProductDto): Promise<ProductDocument> {
    const exists = await this.productModel.exists({ sku: dto.sku.toUpperCase() });
    if (exists) {
      throw new ConflictException('SKU already exists');
    }

    const product = new this.productModel({
      ...dto,
      sku: dto.sku.toUpperCase(),
    });

    return product.save();
  }

  findAll(): Promise<ProductDocument[]> {
    return this.productModel.find({ isActive: true }).sort({ createdAt: -1 }).exec();
  }

  async findById(id: string): Promise<ProductDocument> {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Product not found');
    }

    const product = await this.productModel.findOne({ _id: id, isActive: true }).exec();
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
  }

  async update(id: string, dto: UpdateProductDto): Promise<ProductDocument> {
    await this.findById(id);

    if (dto.sku) {
      const duplicate = await this.productModel.exists({
        _id: { $ne: id },
        sku: dto.sku.toUpperCase(),
      });
      if (duplicate) {
        throw new ConflictException('SKU already exists');
      }
    }

    const updated = await this.productModel
      .findByIdAndUpdate(
        id,
        {
          ...dto,
          ...(dto.sku ? { sku: dto.sku.toUpperCase() } : {}),
        },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException('Product not found');
    }

    return updated;
  }

  async updateStockAndAvgCost(
    productId: string,
    incomingQty: number,
    incomingCostPrice: number,
  ): Promise<ProductDocument> {
    const product = await this.findById(productId);
    const currentValue = product.currentQty * product.avgCostPrice;
    const incomingValue = incomingQty * incomingCostPrice;
    const newQty = product.currentQty + incomingQty;
    const newAvgCost = newQty === 0 ? product.avgCostPrice : (currentValue + incomingValue) / newQty;

    product.currentQty = newQty;
    product.avgCostPrice = Number(newAvgCost.toFixed(4));

    return product.save();
  }

  async decreaseStock(productId: string, qty: number): Promise<ProductDocument> {
    const product = await this.findById(productId);

    if (qty > product.currentQty) {
      throw new ConflictException('Stock out quantity exceeds current stock');
    }

    product.currentQty -= qty;
    return product.save();
  }

  countBy(filter: FilterQuery<ProductDocument>): Promise<number> {
    return this.productModel.countDocuments(filter).exec();
  }

  aggregate(pipeline: PipelineStage[]): Promise<unknown[]> {
    return this.productModel.aggregate(pipeline).exec();
  }
}
