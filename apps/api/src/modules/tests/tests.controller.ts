import { Controller, Get, Post, Patch, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { TestsService } from './tests.service';

@ApiTags('Tests')
@Controller('tests')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Get()
  @ApiOperation({ summary: 'List all automated compliance tests and pass/fail summary' })
  findAll() {
    return this.testsService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Execute an automated compliance check' })
  runTest(@Body() body: any) {
    return this.testsService.runTest(body);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update automated test configuration or status' })
  update(@Param('id') id: string, @Body() body: any) {
    return this.testsService.update(id, body);
  }
}
