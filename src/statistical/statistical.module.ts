import { Module } from '@nestjs/common';
import { StatisticalService } from './statistical.service';
import { StatisticalController } from './statistical.controller';

@Module({
  providers: [StatisticalService],
  controllers: [StatisticalController]
})
export class StatisticalModule {}
