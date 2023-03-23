import { Module } from '@nestjs/common';
import { TransactionService } from 'src/transaction/transaction.service';
import { ResultController } from './result.controller';
import { ResultService } from './result.service';

@Module({
  controllers: [ResultController],
  providers: [ResultService, TransactionService]
})
export class ResultModule {}
