import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateControlDto, UpdateControlDto } from './controls.dto';

@Injectable()
export class ControlsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string, frameworkId?: string) {
    return this.prisma.control.findMany({
      where: {
        framework: {
          organizationId,
          ...(frameworkId ? { id: frameworkId } : {}),
        },
      },
      include: {
        framework: { select: { code: true, name: true } },
        _count: {
          select: { evidenceMappings: true, findings: true, risks: true },
        },
      },
      orderBy: { code: 'asc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const control = await this.prisma.control.findFirst({
      where: {
        id,
        framework: { organizationId },
      },
      include: {
        framework: true,
        evidenceMappings: {
          include: {
            evidence: true,
          },
        },
        findings: true,
        risks: true,
        aiAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!control) {
      throw new NotFoundException(`Control with ID '${id}' not found`);
    }

    return control;
  }

  async create(organizationId: string, dto: CreateControlDto) {
    // Validate framework belongs to org
    const framework = await this.prisma.framework.findFirst({
      where: { id: dto.frameworkId, organizationId },
    });

    if (!framework) {
      throw new NotFoundException(`Framework with ID '${dto.frameworkId}' not found in your organization`);
    }

    return this.prisma.control.create({
      data: {
        ...dto,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateControlDto) {
    await this.findOne(organizationId, id); // Verify ownership

    return this.prisma.control.update({
      where: { id },
      data: dto,
    });
  }
}
