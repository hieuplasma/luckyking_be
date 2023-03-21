import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Order, OrderStatus, User } from '../../node_modules/.prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { CreateOrderMegaPowerDTO, CreateOrderMax3dDTO, ReturnOrderDTO, ConfirmOrderDTO, CreateOrderKenoDTO } from './dto';
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
    @Post('add-keno')
    @Roles(Role.User)
    createOderKeno(@GetUser() user: User, @Body() body: CreateOrderKenoDTO): Promise<Order> {
        return this.orderService.createOrderMax3d(user, body)
    }


    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-all')
    @Roles(Role.User)
    getListOrder(@GetUser() user: User, @Query('status') status: keyof typeof OrderStatus): Promise<Order[]> {
        return this.orderService.getListOrder(user, status)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-by-id')
    @Roles(Role.User, Role.Staff, Role.Admin)
    getOrderById(@Query('orderId') orderId: string): Promise<Order> {
        return this.orderService.getOrderById(orderId)
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
    returnOrder(@GetUser() user: User, @Body() body: ReturnOrderDTO) {
        return this.orderService.returnOrder(user, body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('confirm')
    @Roles(Role.Staff)
    confirmOrder(@GetUser() user: User, @Body() body: ConfirmOrderDTO) {
        return this.orderService.confirmOrder(user, body)
    }
}
