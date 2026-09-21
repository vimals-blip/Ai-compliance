import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateEvidenceDto } from './evidence.dto';

@Injectable()
export class EvidenceService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.evidence.findMany({
      where: { organizationId },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        controlMappings: {
          include: {
            control: { select: { id: true, code: true, title: true } },
          },
        },
        _count: {
          select: { aiAnalyses: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const item = await this.prisma.evidence.findFirst({
      where: { id, organizationId },
      include: {
        uploadedBy: { select: { id: true, name: true, email: true } },
        controlMappings: {
          include: {
            control: true,
          },
        },
        aiAnalyses: {
          include: {
            recommendations: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!item) {
      throw new NotFoundException(`Evidence with ID '${id}' not found`);
    }

    return item;
  }

  async create(organizationId: string, userId: string, dto: CreateEvidenceDto) {
    const { controlIds, ...data } = dto;

    return this.prisma.evidence.create({
      data: {
        ...data,
        organizationId,
        uploadedById: userId,
        status: dto.status || 'PENDING_REVIEW',
        controlMappings: controlIds && controlIds.length > 0
          ? {
              create: controlIds.map((controlId) => ({
                controlId,
              })),
            }
          : undefined,
      },
      include: {
        controlMappings: true,
      },
    });
  }

  async delete(organizationId: string, id: string) {
    await this.findOne(organizationId, id);

    return this.prisma.evidence.delete({
      where: { id },
    });
  }
}
