import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Order, User } from '../../node_modules/.prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { CreateOrderMegaPowerDTO, CreateOrderMax3dDTO, ReturnOrderDTO } from './dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
    constructor(private orderService: OrderService) { }
    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('add-power-mega')
    @Roles(Role.User)
    createOderPowerMega(@GetUser() user: User, @Body() body: CreateOrderMegaPowerDTO): Promise<Order> {
        return this.orderService.createOrderPowerMega(user, body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('add-max3d')
    @Roles(Role.User)
    createOderMax3d(@GetUser() user: User, @Body() body: CreateOrderMax3dDTO): Promise<Order> {
        return this.orderService.createOrderMax3d(user, body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-all')
    @Roles(Role.User)
    getListOrder(@GetUser() user: User): Promise<Order[]> {
        return this.orderService.getListOrder(user)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-pending')
    @Roles(Role.Staff)
    getAllPendingOrder(): Promise<Order[]> {
        return this.orderService.getAllPendingOrder()
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('return')
    @Roles(Role.Staff, Role.User)
    returnOrder(@GetUser() user: User, body: ReturnOrderDTO) {
        return this.orderService.returnOrder(user, body)
    }
}
