import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as XLSX from 'xlsx';
import { InventoryService } from '../inventory/inventory.service';
import { ProductsService } from '../products/products.service';
import { BulkJob, BulkJobDocument } from './schemas/bulk-job.schema';

interface UploadResult {
  totalRows: number;
  successRows: number;
  failedRows: number;
  errors: { message: string; row: number }[];
}

@Injectable()
export class BulkUploadService {
  constructor(
    private readonly productsService: ProductsService,
    private readonly inventoryService: InventoryService,
    @InjectModel(BulkJob.name) private readonly bulkJobModel: Model<BulkJobDocument>,
  ) {}

  async processUpload(
    type: 'PRODUCT_IMPORT' | 'STOCK_IN_BULK' | 'STOCK_OUT_BULK',
    file: Express.Multer.File | undefined,
    userId: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const job = await this.bulkJobModel.create({
      type,
      status: 'PROCESSING',
    });

    try {
      const rows = this.parseSheet(file.buffer);
      const result = await this.dispatch(type, rows, userId);

      job.status = result.failedRows > 0 ? 'FAILED' : 'COMPLETED';
      job.totalRows = result.totalRows;
      job.successRows = result.successRows;
      job.failedRows = result.failedRows;
      job.set('errors', result.errors);
      await job.save();

      return job;
    } catch (error) {
      job.status = 'FAILED';
      job.set('errors', [
        {
          row: 0,
          message: error instanceof Error ? error.message : 'Bulk upload failed',
        },
      ]);
      await job.save();
      throw error;
    }
  }

  private parseSheet(buffer: Buffer): Record<string, unknown>[] {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new BadRequestException('No worksheet found in uploaded file');
    }

    return XLSX.utils.sheet_to_json<Record<string, unknown>>(workbook.Sheets[sheetName], {
      defval: null,
    });
  }

  private async dispatch(
    type: 'PRODUCT_IMPORT' | 'STOCK_IN_BULK' | 'STOCK_OUT_BULK',
    rows: Record<string, unknown>[],
    userId: string,
  ): Promise<UploadResult> {
    if (type === 'PRODUCT_IMPORT') {
      const results = await Promise.allSettled(
        rows.map((row) =>
          this.productsService.create({
            name: String(row.name ?? ''),
            sku: String(row.sku ?? ''),
            size: row.size ? String(row.size) : undefined,
            imageUrl: row.imageUrl ? String(row.imageUrl) : undefined,
            avgCostPrice: Number(row.avgCostPrice ?? 0),
            defaultSalePrice: row.defaultSalePrice ? Number(row.defaultSalePrice) : undefined,
            lowStockThreshold: row.lowStockThreshold ? Number(row.lowStockThreshold) : undefined,
          }),
        ),
      );

      return summarize(results);
    }

    if (type === 'STOCK_IN_BULK') {
      return this.inventoryService.bulkStockIn(
        {
          rows: rows.map((row) => ({
            productId: String(row.productId ?? ''),
            qty: Number(row.qty ?? 0),
            costPrice: Number(row.costPrice ?? 0),
            note: row.note ? String(row.note) : undefined,
          })),
        },
        userId,
      );
    }

    return this.inventoryService.bulkStockOut(
      {
        rows: rows.map((row) => ({
          productId: String(row.productId ?? ''),
          qty: Number(row.qty ?? 0),
          salePrice: Number(row.salePrice ?? 0),
          note: row.note ? String(row.note) : undefined,
        })),
      },
      userId,
    );
  }
}

function summarize(results: PromiseSettledResult<unknown>[]): UploadResult {
  const successRows = results.filter((result) => result.status === 'fulfilled').length;
  const errors = results
    .map((result, index) => ({ result, index }))
    .filter((item): item is { result: PromiseRejectedResult; index: number } => item.result.status === 'rejected')
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
