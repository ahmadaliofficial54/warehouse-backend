import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('inventory-summary')
  inventorySummary() {
    return this.reportsService.getInventorySummary();
  }

  @Get('stock-movement')
  stockMovement(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getStockMovement(from, to);
  }

  @Get('profit-loss')
  profitLoss(@Query('from') from?: string, @Query('to') to?: string) {
    return this.reportsService.getProfitLoss(from, to);
  }
}
