import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { BulkUploadQueryDto } from './dto/bulk-upload-query.dto';
import { BulkUploadService } from './bulk-upload.service';

@ApiTags('Bulk Upload')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@Controller()
export class BulkUploadController {
  constructor(private readonly bulkUploadService: BulkUploadService) {}

  @Post('products/bulk-upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  productsBulkUpload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: { sub: string } },
  ) {
    return this.bulkUploadService.processUpload('PRODUCT_IMPORT', file, req.user.sub);
  }

  @Post('inventory/stock-in/bulk-upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  stockInBulkUpload(@UploadedFile() file: Express.Multer.File, @Req() req: { user: { sub: string } }) {
    return this.bulkUploadService.processUpload('STOCK_IN_BULK', file, req.user.sub);
  }

  @Post('inventory/stock-out/bulk-upload')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  stockOutBulkUpload(@UploadedFile() file: Express.Multer.File, @Req() req: { user: { sub: string } }) {
    return this.bulkUploadService.processUpload('STOCK_OUT_BULK', file, req.user.sub);
  }

  @Post('bulk-upload/process')
  processByType(@Body() dto: BulkUploadQueryDto, @UploadedFile() file: Express.Multer.File, @Req() req: { user: { sub: string } }) {
    return this.bulkUploadService.processUpload(dto.type, file, req.user.sub);
  }
}
