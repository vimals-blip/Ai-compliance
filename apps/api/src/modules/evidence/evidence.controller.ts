import { Controller, Get, Post, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto } from './evidence.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { OrganizationIsolationGuard } from '../../common/guards/organization.guard';

@ApiTags('Evidence')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationIsolationGuard)
@Controller('evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  @ApiOperation({ summary: 'List all evidence documents with control mappings' })
  async findAll(@Request() req: any) {
    return this.evidenceService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evidence metadata and AI analysis history' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.evidenceService.findOne(req.user.organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Register new evidence metadata from object storage' })
  async create(@Request() req: any, @Body() dto: CreateEvidenceDto) {
    return this.evidenceService.create(req.user.organizationId, req.user.userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete evidence metadata' })
  async delete(@Request() req: any, @Param('id') id: string) {
    return this.evidenceService.delete(req.user.organizationId, id);
  }
}
