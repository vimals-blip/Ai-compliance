import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';

@ApiTags('Integrations')
@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  @ApiOperation({ summary: 'List all available and connected integrations' })
  findAll() {
    return this.integrationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get integration by ID' })
  findOne(@Param('id') id: string) {
    return this.integrationsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Update or toggle integration connection status' })
  createOrUpdate(@Body() body: any) {
    return this.integrationsService.update(body.id || body.integrationId, body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update integration connection status by ID' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.integrationsService.update(id, body);
  }

  @Patch()
  @ApiOperation({ summary: 'Update integration connection status' })
  patch(@Body() body: any) {
    return this.integrationsService.update(body.id || body.integrationId, body);
  }

  @Post('test')
  @ApiOperation({ summary: 'Test credentials and connectivity for an integration' })
  testConnection(@Body() body: any) {
    return this.integrationsService.testConnection(body);
  }
}
