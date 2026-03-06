import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { InventoryModule } from '../inventory/inventory.module';
import { ProductsModule } from '../products/products.module';
import { BulkUploadController } from './bulk-upload.controller';
import { BulkUploadService } from './bulk-upload.service';
import { BulkJob, BulkJobSchema } from './schemas/bulk-job.schema';

@Module({
  imports: [
    ProductsModule,
    InventoryModule,
    MongooseModule.forFeature([{ name: BulkJob.name, schema: BulkJobSchema }]),
  ],
  controllers: [BulkUploadController],
  providers: [BulkUploadService],
})
export class BulkUploadModule {}
