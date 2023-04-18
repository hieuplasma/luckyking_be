import { Module } from '@nestjs/common';
import { LotteryModule } from 'src/lottery/lottery.module';
import { NumberLotteryModule } from 'src/numberLottery/numberLottery.module';
import { OrderService } from 'src/order/order.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { UserService } from 'src/user/user.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  imports: [LotteryModule, NumberLotteryModule],
  controllers: [CartController],
  providers: [CartService, UserService]
})
export class CartModule { }
