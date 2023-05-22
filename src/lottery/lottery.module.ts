import { Module } from '@nestjs/common';
import { LotteryService } from './lottery.service';
import { LotteryController } from './lottery.controller';
import { FirebaseModule } from 'src/firebase/firebase.module';

@Module({
  imports: [FirebaseModule],
  providers: [LotteryService],
  controllers: [LotteryController],
  exports: [LotteryService]
})
export class LotteryModule { }
