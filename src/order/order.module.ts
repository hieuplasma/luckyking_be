import { Module } from '@nestjs/common';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { LotteryModule } from 'src/lottery/lottery.module';
import { TransactionService } from 'src/transaction/transaction.service';
import { UserService } from 'src/user/user.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [LotteryModule, FirebaseModule],
  controllers: [OrderController],
  providers: [OrderService, UserService, TransactionService]
})
export class OrderModule { }
