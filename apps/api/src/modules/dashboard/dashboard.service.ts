import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';
import { DashboardSummaryDto } from './dashboard.dto';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(organizationId: string): Promise<DashboardSummaryDto> {
    // 1. Open Risks
    const openRisks = await this.prisma.risk.count({
      where: {
        organizationId,
        status: 'OPEN',
      },
    });

    // 2. Controls Tested & Compliance Score
    const controls = await this.prisma.control.findMany({
      where: {
        framework: {
          organizationId,
        },
      },
      select: {
        status: true,
        isApplicable: true,
      },
    });

    const controlsTested = controls.filter((c) => c.status !== 'NOT_TESTED').length;

    const applicableControls = controls.filter(
      (c) => c.isApplicable && c.status !== 'NOT_APPLICABLE',
    );
    const effectiveControls = applicableControls.filter((c) => c.status === 'EFFECTIVE').length;

    const complianceScore =
      applicableControls.length > 0
        ? Math.round((effectiveControls / applicableControls.length) * 100)
        : 0;

    // 3. Audit Findings (where status != CLOSED)
    const auditFindings = await this.prisma.finding.count({
      where: {
        organizationId,
        status: { not: 'CLOSED' },
      },
    });

    // 4. Compliance Trend & Previous Score
    const snapshots = await this.prisma.complianceSnapshot.findMany({
      where: { organizationId },
      orderBy: { snapshotMonth: 'asc' },
      take: 6,
    });

    const complianceTrend = snapshots.map((s) => ({
      month: s.snapshotMonth,
      score: Math.round(s.score),
    }));

    const previousComplianceScore =
      snapshots.length >= 2
        ? Math.round(snapshots[snapshots.length - 2].score)
        : complianceScore;

    // 5. Risk Heatmap: 5x5 matrix aggregation
    const risks = await this.prisma.risk.findMany({
      where: { organizationId, status: 'OPEN' },
      select: { residualLikelihood: true, residualImpact: true },
    });

    const heatmapMap = new Map<string, number>();
    for (const r of risks) {
      const key = `${r.residualLikelihood}-${r.residualImpact}`;
      heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1);
    }

    const riskHeatmap: { likelihood: number; impact: number; count: number }[] = [];
    for (let l = 1; l <= 5; l++) {
      for (let i = 1; i <= 5; i++) {
        const key = `${l}-${i}`;
        riskHeatmap.push({
          likelihood: l,
          impact: i,
          count: heatmapMap.get(key) || 0,
        });
      }
    }

    // 6. Controls Status breakdown
    const statusCounts: Record<string, number> = {};
    for (const c of controls) {
      statusCounts[c.status] = (statusCounts[c.status] || 0) + 1;
    }

    const totalControls = controls.length || 1;
    const controlsStatus = Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: Number(((count / totalControls) * 100).toFixed(1)),
    }));

    // 7. Recent Findings
    const recentFindings = await this.prisma.finding.findMany({
      where: { organizationId },
      orderBy: { identifiedAt: 'desc' },
      take: 5,
      include: {
        control: { select: { code: true, title: true } },
        audit: { select: { title: true } },
      },
    });

    return {
      openRisks,
      controlsTested,
      auditFindings,
      complianceScore,
      previousComplianceScore,
      riskHeatmap,
      complianceTrend,
      controlsStatus,
      recentFindings,
    };
  }
}
