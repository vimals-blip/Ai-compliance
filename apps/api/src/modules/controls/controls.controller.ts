import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ControlsService } from './controls.service';
import { CreateControlDto, UpdateControlDto } from './controls.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { OrganizationIsolationGuard } from '../../common/guards/organization.guard';

@ApiTags('Controls')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationIsolationGuard)
@Controller('controls')
export class ControlsController {
  constructor(private readonly controlsService: ControlsService) {}

  @Get()
  @ApiOperation({ summary: 'List all compliance controls' })
  @ApiQuery({ name: 'frameworkId', required: false, description: 'Filter by framework UUID' })
  async findAll(@Request() req: any, @Query('frameworkId') frameworkId?: string) {
    return this.controlsService.findAll(req.user.organizationId, frameworkId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details, evidence mappings, and findings for a control' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.controlsService.findOne(req.user.organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Define a new control under a framework' })
  async create(@Request() req: any, @Body() dto: CreateControlDto) {
    return this.controlsService.create(req.user.organizationId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update status, maturity, or applicability of a control' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateControlDto) {
    return this.controlsService.update(req.user.organizationId, id, dto);
  }
}
