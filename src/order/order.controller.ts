import { Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '../../node_modules/.prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { CreateOrderDTO } from './dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    constructor(private orderService: OrderService) {}
    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('create')
    @Roles( Role.User)
    createOder(@GetUser() user: User, body: CreateOrderDTO) {
        return this.orderService.createOrder(user, body)
    }
}
