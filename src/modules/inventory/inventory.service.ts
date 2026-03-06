import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, PipelineStage, Types } from 'mongoose';
import { ProductsService } from '../products/products.service';
import { BulkStockInDto, BulkStockOutDto } from './dto/bulk-stock.dto';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { InventoryMovement, InventoryMovementDocument } from './schemas/inventory-movement.schema';

export interface BulkOperationResult {
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: { message: string; row: number }[];
}

@Injectable()
export class InventoryService {
  constructor(
    private readonly productsService: ProductsService,
    @InjectModel(InventoryMovement.name)
    private readonly movementModel: Model<InventoryMovementDocument>,
  ) {}

  async stockIn(dto: StockInDto, createdBy: string, source: 'single' | 'bulk' = 'single') {
    const product = await this.productsService.updateStockAndAvgCost(dto.productId, dto.qty, dto.costPrice);

    const movement = await this.movementModel.create({
      type: 'IN',
      productId: product._id,
      qty: dto.qty,
      costPrice: dto.costPrice,
      source,
      note: dto.note,
      createdBy: new Types.ObjectId(createdBy),
    });

    return { product, movement };
  }

  async stockOut(dto: StockOutDto, createdBy: string, source: 'single' | 'bulk' = 'single') {
    const product = await this.productsService.findById(dto.productId);
    const avgCostAtTime = product.avgCostPrice;

    const updatedProduct = await this.productsService.decreaseStock(dto.productId, dto.qty);
    const profitOrLoss = Number(((dto.salePrice - avgCostAtTime) * dto.qty).toFixed(2));

    const movement = await this.movementModel.create({
      type: 'OUT',
      productId: updatedProduct._id,
      qty: dto.qty,
      salePrice: dto.salePrice,
      profitOrLoss,
      source,
      note: dto.note,
      createdBy: new Types.ObjectId(createdBy),
    });

    return { product: updatedProduct, movement };
  }

  async bulkStockIn(dto: BulkStockInDto, createdBy: string): Promise<BulkOperationResult> {
    const results = await Promise.allSettled(
      dto.rows.map((row) => this.stockIn(row, createdBy, 'bulk')),
    );

    return this.summarizeBulk(results);
  }

  async bulkStockOut(dto: BulkStockOutDto, createdBy: string): Promise<BulkOperationResult> {
    const results = await Promise.allSettled(
      dto.rows.map((row) => this.stockOut(row, createdBy, 'bulk')),
    );

    return this.summarizeBulk(results);
  }

  findMovements() {
    return this.movementModel
      .find()
      .sort({ createdAt: -1 })
      .populate('productId', 'name sku')
      .populate('createdBy', 'username role')
      .exec();
  }

  aggregate(pipeline: PipelineStage[]) {
    return this.movementModel.aggregate(pipeline).exec();
  }

  private summarizeBulk(results: PromiseSettledResult<unknown>[]): BulkOperationResult {
    const successRows = results.filter((result) => result.status === 'fulfilled').length;
    const errors = results
      .map((result, index) => ({ result, index }))
      .filter(
        (item): item is { result: PromiseRejectedResult; index: number } =>
          item.result.status === 'rejected',
      )
      .map((item) => ({
        row: item.index + 1,
        message: item.result.reason instanceof Error ? item.result.reason.message : 'Unknown error',
      }));

    return {
      totalRows: results.length,
      successRows,
      failedRows: errors.length,
      errors,
    };
  }
}
