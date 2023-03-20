import { Module } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  controllers: [OrderController],
  providers: [OrderService, UserService]
})
export class OrderModule {}
