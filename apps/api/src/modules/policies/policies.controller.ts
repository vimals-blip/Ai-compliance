import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PoliciesService } from './policies.service';

@ApiTags('Policies')
@Controller('policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  @ApiOperation({ summary: 'List all compliance policies' })
  findAll() {
    return this.policiesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get policy by ID' })
  findOne(@Param('id') id: string) {
    return this.policiesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create or upload a new compliance policy' })
  create(@Body() body: any) {
    return this.policiesService.create(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing compliance policy' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.policiesService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a compliance policy' })
  remove(@Param('id') id: string) {
    return this.policiesService.remove(id);
  }
}
