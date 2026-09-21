import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SoaService } from './soa.service';
import { CreateStatementOfApplicabilityDto, UpdateStatementOfApplicabilityDto, CreateApplicabilityStatementDto, UpdateApplicabilityStatementDto } from './soa.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { OrganizationIsolationGuard } from '../../common/guards/organization.guard';

@ApiTags('Statement of Applicability')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationIsolationGuard)
@Controller('soa')
export class SoaController {
  constructor(private readonly soaService: SoaService) {}

  @Get()
  @ApiOperation({ summary: 'List all SOAs' })
  async findAll(@Request() req: any) { return this.soaService.findAll(req.user.organizationId); }

  @Get(':id')
  @ApiOperation({ summary: 'Get SOA with applicability statements' })
  async findOne(@Request() req: any, @Param('id') id: string) { return this.soaService.findOne(req.user.organizationId, id); }

  @Post()
  @ApiOperation({ summary: 'Create a new SOA' })
  async create(@Request() req: any, @Body() dto: CreateStatementOfApplicabilityDto) { return this.soaService.create(req.user.organizationId, dto); }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an SOA' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateStatementOfApplicabilityDto) { return this.soaService.update(req.user.organizationId, id, dto); }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an SOA' })
  async remove(@Request() req: any, @Param('id') id: string) { return this.soaService.delete(req.user.organizationId, id); }

  @Post(':id/statements')
  @ApiOperation({ summary: 'Add applicability statement to SOA' })
  async addStatement(@Request() req: any, @Param('id') id: string, @Body() dto: CreateApplicabilityStatementDto) { return this.soaService.addStatement(req.user.organizationId, id, dto); }

  @Patch(':id/statements/:sid')
  @ApiOperation({ summary: 'Update an applicability statement' })
  async updateStatement(@Request() req: any, @Param('id') id: string, @Param('sid') sid: string, @Body() dto: UpdateApplicabilityStatementDto) { return this.soaService.updateStatement(req.user.organizationId, id, sid, dto); }

  @Delete(':id/statements/:sid')
  @ApiOperation({ summary: 'Remove an applicability statement' })
  async removeStatement(@Request() req: any, @Param('id') id: string, @Param('sid') sid: string) { return this.soaService.removeStatement(req.user.organizationId, id, sid); }
}
