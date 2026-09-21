import { Module } from '@nestjs/common';
import { SoaService } from './soa.service';
import { SoaController } from './soa.controller';
import { DatabaseModule } from '../../common/database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [SoaController],
  providers: [SoaService],
  exports: [SoaService],
})
export class SoaModule {}
