import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from '../products/products.module';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryMovement, InventoryMovementSchema } from './schemas/inventory-movement.schema';

@Module({
  imports: [
    ProductsModule,
    MongooseModule.forFeature([{ name: InventoryMovement.name, schema: InventoryMovementSchema }]),
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService, MongooseModule],
})
export class InventoryModule {}
