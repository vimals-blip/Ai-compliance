import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FindingsService } from './findings.service';
import { CreateFindingDto, UpdateFindingDto } from './findings.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { OrganizationIsolationGuard } from '../../common/guards/organization.guard';

@ApiTags('Findings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationIsolationGuard)
@Controller('findings')
export class FindingsController {
  constructor(private readonly findingsService: FindingsService) {}

  @Get()
  @ApiOperation({ summary: 'List all audit findings' })
  async findAll(@Request() req: any) {
    return this.findingsService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a finding' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.findingsService.findOne(req.user.organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Log a new audit finding' })
  async create(@Request() req: any, @Body() dto: CreateFindingDto) {
    return this.findingsService.create(req.user.organizationId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update finding severity, status, or remediation notes' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateFindingDto) {
    return this.findingsService.update(req.user.organizationId, id, dto);
  }
}
