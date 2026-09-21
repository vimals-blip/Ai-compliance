import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './common/database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { FrameworksModule } from './modules/frameworks/frameworks.module';
import { ControlsModule } from './modules/controls/controls.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { RisksModule } from './modules/risks/risks.module';
import { AuditsModule } from './modules/audits/audits.module';
import { FindingsModule } from './modules/findings/findings.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AIModule } from './modules/ai/ai.module';
import { SoaModule } from './modules/soa/soa.module';
import { MeasuresModule } from './modules/measures/measures.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../../.env'],
    }),
    DatabaseModule,
    AuthModule,
    OrganizationsModule,
    FrameworksModule,
    ControlsModule,
    EvidenceModule,
    RisksModule,
    AuditsModule,
    FindingsModule,
    DashboardModule,
    AIModule,
    SoaModule,
    MeasuresModule,
  ],
})
export class AppModule {}
