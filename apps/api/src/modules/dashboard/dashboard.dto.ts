import { ApiProperty } from '@nestjs/swagger';

export class RiskHeatmapCellDto {
  @ApiProperty({ example: 5 })
  likelihood: number;

  @ApiProperty({ example: 4 })
  impact: number;

  @ApiProperty({ example: 3 })
  count: number;
}

export class ComplianceTrendPointDto {
  @ApiProperty({ example: '2025-05' })
  month: string;

  @ApiProperty({ example: 94 })
  score: number;
}

export class ControlsStatusSummaryDto {
  @ApiProperty({ example: 'EFFECTIVE' })
  status: string;

  @ApiProperty({ example: 120 })
  count: number;

  @ApiProperty({ example: 75.5 })
  percentage: number;
}

export class DashboardSummaryDto {
  @ApiProperty({ example: 47 })
  openRisks: number;

  @ApiProperty({ example: 312 })
  controlsTested: number;

  @ApiProperty({ example: 18 })
  auditFindings: number;

  @ApiProperty({ example: 94 })
  complianceScore: number;

  @ApiProperty({ example: 91 })
  previousComplianceScore: number;

  @ApiProperty({ type: [RiskHeatmapCellDto] })
  riskHeatmap: RiskHeatmapCellDto[];

  @ApiProperty({ type: [ComplianceTrendPointDto] })
  complianceTrend: ComplianceTrendPointDto[];

  @ApiProperty({ type: [ControlsStatusSummaryDto] })
  controlsStatus: ControlsStatusSummaryDto[];

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  recentFindings: any[];
}
