import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MeasuresService } from './measures.service';
import { CreateMeasureDto, UpdateMeasureDto, AssignControlDto, AssignEvidenceDto } from './measures.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { OrganizationIsolationGuard } from '../../common/guards/organization.guard';

@ApiTags('Measures')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationIsolationGuard)
@Controller('measures')
export class MeasuresController {
  constructor(private readonly measuresService: MeasuresService) {}

  @Get()
  @ApiOperation({ summary: 'List all measures' })
  async findAll(@Request() req: any) { return this.measuresService.findAll(req.user.organizationId); }

  @Get(':id')
  @ApiOperation({ summary: 'Get measure with linked controls and evidence' })
  async findOne(@Request() req: any, @Param('id') id: string) { return this.measuresService.findOne(req.user.organizationId, id); }

  @Post()
  @ApiOperation({ summary: 'Create a new measure' })
  async create(@Request() req: any, @Body() dto: CreateMeasureDto) { return this.measuresService.create(req.user.organizationId, dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a measure' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateMeasureDto) { return this.measuresService.update(req.user.organizationId, id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a measure' })
  async remove(@Request() req: any, @Param('id') id: string) { return this.measuresService.delete(req.user.organizationId, id); }

  @Post(':id/controls')
  @ApiOperation({ summary: 'Assign a control to this measure (test once, comply many)' })
  async assignControl(@Request() req: any, @Param('id') id: string, @Body() dto: AssignControlDto) { return this.measuresService.assignControl(req.user.organizationId, id, dto); }

  @Delete(':id/controls/:controlId')
  @ApiOperation({ summary: 'Unassign a control from this measure' })
  async unassignControl(@Request() req: any, @Param('id') id: string, @Param('controlId') controlId: string) { return this.measuresService.unassignControl(req.user.organizationId, id, controlId); }

  @Post(':id/evidence')
  @ApiOperation({ summary: 'Assign evidence to this measure' })
  async assignEvidence(@Request() req: any, @Param('id') id: string, @Body() dto: AssignEvidenceDto) { return this.measuresService.assignEvidence(req.user.organizationId, id, dto); }

  @Delete(':id/evidence/:evidenceId')
  @ApiOperation({ summary: 'Unassign evidence from this measure' })
  async unassignEvidence(@Request() req: any, @Param('id') id: string, @Param('evidenceId') evidenceId: string) { return this.measuresService.unassignEvidence(req.user.organizationId, id, evidenceId); }
}
