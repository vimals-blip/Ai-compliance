import { Controller, Post, Body, Res } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response } from 'express';
import { ExportService } from './export.service';

@ApiTags('Export')
@Controller('export')
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  @Post('auditor-package')
  @ApiOperation({ summary: 'Generate and download compiled auditor evidence ZIP bundle' })
  async exportAuditorPackage(@Body() body: any, @Res() res: Response) {
    const { buffer, filename } = await this.exportService.generateAuditorPackage(body);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': buffer.length.toString(),
    });
    return res.send(buffer);
  }
}
