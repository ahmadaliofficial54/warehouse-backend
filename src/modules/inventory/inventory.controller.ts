import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BulkStockInDto, BulkStockOutDto } from './dto/bulk-stock.dto';
import { StockInDto } from './dto/stock-in.dto';
import { StockOutDto } from './dto/stock-out.dto';
import { InventoryService } from './inventory.service';

@ApiTags('Inventory')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('stock-in')
  stockIn(@Body() dto: StockInDto, @Req() req: { user: { sub: string } }) {
    return this.inventoryService.stockIn(dto, req.user.sub);
  }

  @Post('stock-out')
  stockOut(@Body() dto: StockOutDto, @Req() req: { user: { sub: string } }) {
    return this.inventoryService.stockOut(dto, req.user.sub);
  }

  @Post('stock-in/bulk')
  stockInBulk(@Body() dto: BulkStockInDto, @Req() req: { user: { sub: string } }) {
    return this.inventoryService.bulkStockIn(dto, req.user.sub);
  }

  @Post('stock-out/bulk')
  stockOutBulk(@Body() dto: BulkStockOutDto, @Req() req: { user: { sub: string } }) {
    return this.inventoryService.bulkStockOut(dto, req.user.sub);
  }

  @Get('movements')
  movements() {
    return this.inventoryService.findMovements();
  }
}
