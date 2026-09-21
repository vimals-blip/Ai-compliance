import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AIService } from './ai.service';
import { TriggerEvidenceAnalysisDto, ReviewAIAnalysisDto } from './ai.dto';
import { JwtAuthGuard } from '../../common/guards/auth.guard';
import { OrganizationIsolationGuard } from '../../common/guards/organization.guard';

@ApiTags('AI')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, OrganizationIsolationGuard)
@Controller('ai')
export class AIController {
  constructor(private readonly aiService: AIService) {}

  @Post('evidence/:evidenceId/analyze')
  @ApiOperation({ summary: 'Queue AI evidence analysis against specified controls' })
  async analyzeEvidence(
    @Request() req: any,
    @Param('evidenceId') evidenceId: string,
    @Body() dto: TriggerEvidenceAnalysisDto,
  ) {
    return this.aiService.queueEvidenceAnalysis(
      req.user.organizationId,
      evidenceId,
      dto,
    );
  }

  @Get('analyses/:id')
  @ApiOperation({ summary: 'Get structured AI analysis results, citations, and gaps' })
  async getAnalysis(@Request() req: any, @Param('id') id: string) {
    return this.aiService.getAnalysis(req.user.organizationId, id);
  }

  @Patch('analyses/:id/review')
  @ApiOperation({ summary: 'Human reviewer accepts, rejects, or marks AI analysis as reviewed' })
  async reviewAnalysis(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: ReviewAIAnalysisDto,
  ) {
    return this.aiService.reviewAnalysis(
      req.user.organizationId,
      req.user.userId,
      id,
      dto,
    );
  }
}
