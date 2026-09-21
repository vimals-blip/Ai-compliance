import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateMeasureDto, UpdateMeasureDto, AssignControlDto, AssignEvidenceDto } from './measures.dto';

@Injectable()
export class MeasuresService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.measure.findMany({ where: { organizationId }, orderBy: { createdAt: 'desc' } });
  }

  async findOne(organizationId: string, id: string) {
    const measure = await this.prisma.measure.findFirst({
      where: { id, organizationId },
      include: {
        controls: { include: { control: { select: { id: true, code: true, title: true } } } },
        evidence: { include: { evidence: { select: { id: true, name: true, type: true } } } },
      },
    });
    if (!measure) throw new NotFoundException(`Measure '${id}' not found`);
    return measure;
  }

  async create(organizationId: string, dto: CreateMeasureDto) {
    return this.prisma.measure.create({ data: { organizationId, name: dto.name, description: dto.description, status: dto.status || 'NOT_TESTED' } });
  }

  async update(organizationId: string, id: string, dto: UpdateMeasureDto) {
    await this.findOne(organizationId, id);
    return this.prisma.measure.update({ where: { id }, data: { ...(dto.name ? { name: dto.name } : {}), ...(dto.description !== undefined ? { description: dto.description } : {}), ...(dto.status ? { status: dto.status } : {}) } });
  }

  async delete(organizationId: string, id: string) {
    await this.findOne(organizationId, id);
    return this.prisma.measure.delete({ where: { id } });
  }

  async assignControl(organizationId: string, measureId: string, dto: AssignControlDto) {
    await this.findOne(organizationId, measureId);
    return this.prisma.controlMeasure.create({ data: { measureId, controlId: dto.controlId } });
  }

  async unassignControl(organizationId: string, measureId: string, controlId: string) {
    await this.findOne(organizationId, measureId);
    const mapping = await this.prisma.controlMeasure.findFirst({ where: { measureId, controlId } });
    if (!mapping) throw new NotFoundException('Control mapping not found');
    return this.prisma.controlMeasure.delete({ where: { id: mapping.id } });
  }

  async assignEvidence(organizationId: string, measureId: string, dto: AssignEvidenceDto) {
    await this.findOne(organizationId, measureId);
    return this.prisma.measureEvidence.create({ data: { measureId, evidenceId: dto.evidenceId, notes: dto.notes } });
  }

  async unassignEvidence(organizationId: string, measureId: string, evidenceId: string) {
    await this.findOne(organizationId, measureId);
    const mapping = await this.prisma.measureEvidence.findFirst({ where: { measureId, evidenceId } });
    if (!mapping) throw new NotFoundException('Evidence mapping not found');
    return this.prisma.measureEvidence.delete({ where: { id: mapping.id } });
  }
}
