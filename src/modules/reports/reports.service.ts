import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class ReportsService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly inventoryService: InventoryService,
  ) {}

  async getInventorySummary() {
    const [totalProducts, inStockCount, outOfStockCount, lowStockCount, totalUnitsAgg] = await Promise.all([
      this.productsService.countBy({ isActive: true }),
      this.productsService.countBy({ isActive: true, currentQty: { $gt: 0 } }),
      this.productsService.countBy({ isActive: true, currentQty: 0 }),
      this.productsService.aggregate([
        {
          $match: {
            isActive: true,
            $expr: { $lte: ['$currentQty', '$lowStockThreshold'] },
          },
        },
        { $count: 'count' },
      ]),
      this.productsService.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, totalUnits: { $sum: '$currentQty' } } },
      ]),
    ]);

    return {
      totalProducts,
      inStockCount,
      outOfStockCount,
      lowStockCount: (lowStockCount[0] as { count: number } | undefined)?.count ?? 0,
      totalUnitsInInventory: (totalUnitsAgg[0] as { totalUnits: number } | undefined)?.totalUnits ?? 0,
    };
  }

  async getStockMovement(from?: string, to?: string) {
    const filter = buildDateFilter(from, to);

    const [inSummary, outSummary] = await Promise.all([
      this.inventoryService.aggregate([
        { $match: { ...filter, type: 'IN' } },
        { $group: { _id: null, totalInQty: { $sum: '$qty' } } },
      ]),
      this.inventoryService.aggregate([
        { $match: { ...filter, type: 'OUT' } },
        { $group: { _id: null, totalOutQty: { $sum: '$qty' } } },
      ]),
    ]);

    return {
      from: from ?? null,
      to: to ?? null,
      totalStockInQty: (inSummary[0] as { totalInQty: number } | undefined)?.totalInQty ?? 0,
      totalStockOutQty: (outSummary[0] as { totalOutQty: number } | undefined)?.totalOutQty ?? 0,
    };
  }

  async getProfitLoss(from?: string, to?: string) {
    const filter = buildDateFilter(from, to);

    const [revenueAgg, cogsAgg, pnlAgg] = await Promise.all([
      this.inventoryService.aggregate([
        { $match: { ...filter, type: 'OUT' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: { $multiply: ['$qty', '$salePrice'] } },
          },
        },
      ]),
      this.inventoryService.aggregate([
        { $match: { ...filter, type: 'OUT' } },
        {
          $group: {
            _id: null,
            totalCostOfGoodsSold: { $sum: { $subtract: [{ $multiply: ['$qty', '$salePrice'] }, '$profitOrLoss'] } },
          },
        },
      ]),
      this.inventoryService.aggregate([
        { $match: { ...filter, type: 'OUT' } },
        { $group: { _id: null, netProfitOrLoss: { $sum: '$profitOrLoss' } } },
      ]),
    ]);

    return {
      from: from ?? null,
      to: to ?? null,
      totalRevenue: (revenueAgg[0] as { totalRevenue: number } | undefined)?.totalRevenue ?? 0,
      totalCostOfGoodsSold:
        (cogsAgg[0] as { totalCostOfGoodsSold: number } | undefined)?.totalCostOfGoodsSold ?? 0,
      netProfitOrLoss: (pnlAgg[0] as { netProfitOrLoss: number } | undefined)?.netProfitOrLoss ?? 0,
    };
  }
}

function buildDateFilter(from?: string, to?: string): Record<string, unknown> {
  if (!from && !to) {
    return {};
  }

  const createdAt: Record<string, Date> = {};
  if (from) {
    createdAt.$gte = new Date(from);
  }
  if (to) {
    createdAt.$lte = new Date(to);
  }

  return { createdAt };
}
