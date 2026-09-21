import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateStatementOfApplicabilityDto, UpdateStatementOfApplicabilityDto, CreateApplicabilityStatementDto, UpdateApplicabilityStatementDto } from './soa.dto';

@Injectable()
export class SoaService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.statementOfApplicability.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const soa = await this.prisma.statementOfApplicability.findFirst({
      where: { id, organizationId },
      include: { applicabilityStatements: { include: { control: { select: { code: true, title: true } } } } },
    });
    if (!soa) throw new NotFoundException(`SOA '${id}' not found`);
    return soa;
  }

  async create(organizationId: string, dto: CreateStatementOfApplicabilityDto) {
    return this.prisma.statementOfApplicability.create({
      data: { organizationId, name: dto.name, snapshotDate: dto.snapshotDate ? new Date(dto.snapshotDate) : new Date() },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateStatementOfApplicabilityDto) {
    await this.findOne(organizationId, id);
    return this.prisma.statementOfApplicability.update({
      where: { id },
      data: { ...(dto.name ? { name: dto.name } : {}), ...(dto.snapshotDate ? { snapshotDate: new Date(dto.snapshotDate) } : {}) },
    });
  }

  async delete(organizationId: string, id: string) {
    await this.findOne(organizationId, id);
    return this.prisma.statementOfApplicability.delete({ where: { id } });
  }

  async addStatement(organizationId: string, soaId: string, dto: CreateApplicabilityStatementDto) {
    await this.findOne(organizationId, soaId);
    return this.prisma.applicabilityStatement.create({
      data: { statementOfApplicabilityId: soaId, controlId: dto.controlId, isApplicable: dto.isApplicable, justification: dto.justification },
    });
  }

  async updateStatement(organizationId: string, soaId: string, statementId: string, dto: UpdateApplicabilityStatementDto) {
    await this.findOne(organizationId, soaId);
    return this.prisma.applicabilityStatement.update({
      where: { id: statementId },
      data: { ...(dto.isApplicable !== undefined ? { isApplicable: dto.isApplicable } : {}), ...(dto.justification !== undefined ? { justification: dto.justification } : {}) },
    });
  }

  async removeStatement(organizationId: string, soaId: string, statementId: string) {
    await this.findOne(organizationId, soaId);
    return this.prisma.applicabilityStatement.delete({ where: { id: statementId } });
  }
}
