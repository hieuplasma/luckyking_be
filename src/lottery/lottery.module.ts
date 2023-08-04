import { Module } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { LotteryController } from './lottery.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { ResultModule } from 'src/result/result.module';

@Module({
  imports: [FirebaseModule, ResultModule],
  providers: [LotteryService],
  controllers: [LotteryController],
  exports: [LotteryService]
})
export class LotteryModule { }
