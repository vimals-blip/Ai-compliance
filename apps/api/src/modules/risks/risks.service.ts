import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { CreateRiskDto, UpdateRiskDto, calculateRiskSeverity } from './risks.dto';

@Injectable()
export class RisksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(organizationId: string) {
    return this.prisma.risk.findMany({
      where: { organizationId },
      include: {
        control: { select: { code: true, title: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
      orderBy: { inherentRiskScore: 'desc' },
    });
  }

  async findOne(organizationId: string, id: string) {
    const risk = await this.prisma.risk.findFirst({
      where: { id, organizationId },
      include: {
        control: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    if (!risk) {
      throw new NotFoundException(`Risk with ID '${id}' not found`);
    }

    return risk;
  }

  async create(organizationId: string, dto: CreateRiskDto) {
    const { riskScore: inherentRiskScore, severity } = calculateRiskSeverity(dto.inherentLikelihood, dto.inherentImpact);
    
    // Default residual to inherent if not provided
    const residualLikelihood = dto.residualLikelihood ?? dto.inherentLikelihood;
    const residualImpact = dto.residualImpact ?? dto.inherentImpact;
    const { riskScore: residualRiskScore } = calculateRiskSeverity(residualLikelihood, residualImpact);

    return this.prisma.risk.create({
      data: {
        organizationId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        inherentLikelihood: dto.inherentLikelihood,
        inherentImpact: dto.inherentImpact,
        inherentRiskScore,
        residualLikelihood,
        residualImpact,
        residualRiskScore,
        severity,
        status: dto.status || 'OPEN',
        treatment: dto.treatment,
        controlId: dto.controlId,
        ownerId: dto.ownerId,
      },
    });
  }

  async update(organizationId: string, id: string, dto: UpdateRiskDto) {
    const existing = await this.findOne(organizationId, id);

    const inherentLikelihood = dto.inherentLikelihood ?? existing.inherentLikelihood;
    const inherentImpact = dto.inherentImpact ?? existing.inherentImpact;
    const { riskScore: inherentRiskScore, severity } = calculateRiskSeverity(inherentLikelihood, inherentImpact);

    const residualLikelihood = dto.residualLikelihood ?? existing.residualLikelihood;
    const residualImpact = dto.residualImpact ?? existing.residualImpact;
    const { riskScore: residualRiskScore } = calculateRiskSeverity(residualLikelihood, residualImpact);

    return this.prisma.risk.update({
      where: { id },
      data: {
        ...(dto.title ? { title: dto.title } : {}),
        ...(dto.description ? { description: dto.description } : {}),
        ...(dto.status ? { status: dto.status } : {}),
        ...(dto.ownerId ? { ownerId: dto.ownerId } : {}),
        ...(dto.treatment ? { treatment: dto.treatment } : {}),
        inherentLikelihood,
        inherentImpact,
        inherentRiskScore,
        residualLikelihood,
        residualImpact,
        residualRiskScore,
        severity,
      },
    });
  }
}
