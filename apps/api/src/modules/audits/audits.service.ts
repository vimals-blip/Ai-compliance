import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateAuditDto } from './audits.dto';

@Injectable()
export class AuditsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.audit.findMany({
      where: { organizationId },
      include: {
        framework: { select: { code: true, name: true } },
        leadAuditor: { select: { id: true, name: true, email: true } },
        _count: { select: { findings: true } },
      },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const audit = await this.prisma.audit.findFirst({
      where: { id, organizationId },
      include: {
        framework: true,
        leadAuditor: { select: { id: true, name: true, email: true } },
        findings: {
          include: {
            control: { select: { code: true, title: true } },
            assignedTo: { select: { name: true } },
          },
        },
      },
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID '${id}' not found`);
    }

    return audit;
  }

  async create(organizationId: string, dto: CreateAuditDto) {
    const framework = await this.prisma.framework.findFirst({
      where: { id: dto.frameworkId, organizationId },
    });

    if (!framework) {
      throw new NotFoundException(`Framework with ID '${dto.frameworkId}' not found`);
    }

    return this.prisma.audit.create({
      data: {
        ...dto,
        organizationId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }
}
