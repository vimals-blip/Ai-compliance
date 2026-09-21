import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FrameworksService } from './frameworks.service';
import { CreateFrameworkDto } from './frameworks.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { OrganizationIsolationGuard } from '../../common/guards/organization.guard';

@ApiTags('Frameworks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationIsolationGuard)
@Controller('frameworks')
export class FrameworksController {
  constructor(private readonly frameworksService: FrameworksService) {}

  @Get()
  @ApiOperation({ summary: 'List all frameworks for current organization' })
  async findAll(@Request() req: any) {
    return this.frameworksService.findAll(req.user.organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get details and controls of a framework' })
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.frameworksService.findOne(req.user.organizationId, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create or register a new compliance framework' })
  async create(@Request() req: any, @Body() dto: CreateFrameworkDto) {
    return this.frameworksService.create(req.user.organizationId, dto);
  }
}
