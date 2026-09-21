import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateFindingDto, UpdateFindingDto } from './findings.dto';

@Injectable()
export class FindingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.finding.findMany({
      where: { organizationId },
      include: {
        audit: { select: { id: true, title: true } },
        control: { select: { id: true, code: true, title: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: { identifiedAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const finding = await this.prisma.finding.findFirst({
      where: { id, organizationId },
      include: {
        audit: true,
        control: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        tasks: true,
      },
    });

    if (!finding) {
      throw new NotFoundException(`Finding with ID '${id}' not found`);
    }

    return finding;
  }

  async create(organizationId: string, dto: CreateFindingDto) {
    const audit = await this.prisma.audit.findFirst({
      where: { id: dto.auditId, organizationId },
    });

    if (!audit) {
      throw new NotFoundException(`Audit with ID '${dto.auditId}' not found`);
    }

    return this.prisma.finding.create({
      data: {
        ...dto,
        organizationId,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateFindingDto) {
    await this.findOne(organizationId, id);

    return this.prisma.finding.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.severity ? { severity: dto.severity } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.assignedToId ? { assignedToId: dto.assignedToId } : {}),
        ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
        ...(dto.resolutionNotes ? { resolutionNotes: dto.resolutionNotes } : {}),
      },
    });
  }
}
