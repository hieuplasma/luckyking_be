import { Module } from '@nestjs/common';
import { LotteryService } from 'src/lottery/lottery.service';
import { OrderService } from 'src/order/order.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { UserService } from 'src/user/user.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService, UserService, LotteryService]
})
export class CartModule {}
