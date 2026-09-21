import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { TriggerEvidenceAnalysisDto, ReviewAIAnalysisDto } from './ai.dto';

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private readonly prisma: PrismaService) {}

  async queueEvidenceAnalysis(
    organizationId: string,
    evidenceId: string,
    dto: TriggerEvidenceAnalysisDto,
  ) {
    const evidence = await this.prisma.evidence.findFirst({
      where: { id: evidenceId, organizationId },
    });

    if (!evidence) {
      throw new NotFoundException(`Evidence with ID '${evidenceId}' not found`);
    }

    // Create an AI job record with idempotency
    const idempotencyKey = `evidence-analysis-${evidenceId}-${dto.controlIds.sort().join('-')}`;

    const existingJob = await this.prisma.aIJob.findUnique({
      where: { idempotencyKey },
    });

    if (existingJob && existingJob.status === 'PROCESSING') {
      return {
        message: 'Analysis job is already in progress',
        jobId: existingJob.id,
        status: existingJob.status,
      };
    }

    const job = await this.prisma.aIJob.upsert({
      where: { idempotencyKey },
      create: {
        organizationId,
        jobType: 'EVIDENCE_ANALYSIS',
        status: 'QUEUED',
        idempotencyKey,
        payload: {
          organizationId,
          evidenceId,
          controlIds: dto.controlIds,
          storageKey: evidence.storageKey,
          mimeType: evidence.mimeType,
        },
      },
      update: {
        status: 'QUEUED',
        retries: { increment: 1 },
      },
    });

    this.logger.log(`Queued AI evidence analysis job ${job.id} for evidence ${evidenceId}`);

    return {
      message: 'Evidence analysis job queued successfully',
      jobId: job.id,
      status: job.status,
    };
  }

  async getAnalysis(organizationId: string, id: string) {
    const analysis = await this.prisma.aIAnalysis.findFirst({
      where: { id, organizationId },
      include: {
        evidence: { select: { id: true, name: true, storageKey: true } },
        control: { select: { id: true, code: true, title: true } },
        recommendations: true,
      },
    });

    if (!analysis) {
      throw new NotFoundException(`AI Analysis with ID '${id}' not found`);
    }

    return analysis;
  }

  async reviewAnalysis(
    organizationId: string,
    userId: string,
    id: string,
    dto: ReviewAIAnalysisDto,
  ) {
    await this.getAnalysis(organizationId, id);

    return this.prisma.aIAnalysis.update({
      where: { id },
      data: {
        reviewStatus: dto.reviewStatus,
        reviewedById: userId,
        reviewedAt: new Date(),
      },
    });
  }
}
