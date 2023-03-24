import { Module } from '@nestjs/common';
import { OrderService } from 'src/order/order.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { UserService } from 'src/user/user.service';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';

@Module({
  controllers: [CartController],
  providers: [CartService, OrderService, UserService, TransactionService]
})
export class CartModule {}
