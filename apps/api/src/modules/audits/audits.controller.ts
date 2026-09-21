import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuditsService } from './audits.service';
import { CreateAuditDto } from './audits.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { OrganizationIsolationGuard } from '../../common/guards/organization.guard';

@ApiTags('Audits')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationIsolationGuard)
@Controller('audits')
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Get()
  @ApiOperation({ summary: 'List all audits' })
  async findAll(@Request() req: any) {
    return this.auditsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get audit details with findings' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.auditsService.findOne(req.user.organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Plan and schedule a new audit' })
  async create(@Request() req: any, @Body() dto: CreateAuditDto) {
    return this.auditsService.create(req.user.organizationId, dto);
  }
}
