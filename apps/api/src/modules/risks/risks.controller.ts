import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RisksService } from './risks.service';
import { CreateRiskDto, UpdateRiskDto } from './risks.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { OrganizationIsolationGuard } from '../../common/guards/organization.guard';

@ApiTags('Risks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationIsolationGuard)
@Controller('risks')
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  @Get()
  @ApiOperation({ summary: 'List all risks for current organization' })
  async findAll(@Request() req: any) {
    return this.risksService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details of a risk' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.risksService.findOne(req.user.organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new risk with deterministic severity calculation' })
  async create(@Request() req: any, @Body() dto: CreateRiskDto) {
    return this.risksService.create(req.user.organizationId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update risk likelihood, impact, status, or details' })
  async update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdateRiskDto) {
    return this.risksService.update(req.user.organizationId, id, dto);
  }
}
