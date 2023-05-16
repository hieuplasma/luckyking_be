import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Order, OrderStatus, User } from '../../node_modules/.prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { CreateOrderMegaPowerDTO, CreateOrderMax3dDTO, ReturnOrderDTO, ConfirmOrderDTO, CreateOrderKenoDTO, CreateOrderFromCartDTO, lockMultiOrderDTO } from './dto';
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
        return this.orderService.createOrderKeno(user, body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('add-multi')
    @Roles(Role.User)
    createOderFromCart(@GetUser() user: User, @Body() body: CreateOrderFromCartDTO): Promise<Order> {
        const { lotteryIds, method } = body;
        return this.orderService.createOrderFromCart(user, lotteryIds, method);
    }


    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-all')
    @Roles(Role.User)
    getListOrderByUser(
        @GetUser() user: User, @Query('status') status: keyof typeof OrderStatus,
        @Query('ticketType') ticketType: string): Promise<Order[]> {
        return this.orderService.getListOrderByUser(user, status, ticketType)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-by-id/:orderId')
    @Roles(Role.User, Role.Staff, Role.Admin)
    getOrderById(@Param('orderId') orderId: string): Promise<Order> {
        return this.orderService.getOrderById(orderId)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-by-display-id/:id')
    @Roles(Role.User, Role.Staff, Role.Admin)
    getOrderByDisplayId(@Param('id') displayOrderId: number): Promise<Order> {
        return this.orderService.getOrderByDisplayId(+displayOrderId)
    }


    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-all-order')
    @Roles(Role.Staff)
    getAllOrder(
        @Query('status') status: (keyof typeof OrderStatus)[],
        @Query('ticketType') ticketType: string,
        @Query('startDate') startDate: Date,
        @Query('endDate') endDate: Date,
    ): Promise<Order[]> {
        return this.orderService.getAllOrder(status, ticketType, startDate, endDate)
    }


    // ========================== this api for test ======================
    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('keno-get-one')
    @Roles(Role.Staff)
    getOneKenoOrder(
        @GetUser() user: User,
        @Query('status') status: (keyof typeof OrderStatus)[],
    ): Promise<Order> {
        return this.orderService.getOneKenoOrder(user, status)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('keno-count')
    @Roles(Role.Staff)
    countKenoPendingOrder(
        @Query('status') status: (keyof typeof OrderStatus)[],
    ): Promise<number> {
        return this.orderService.countKenoPendingOrder();
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

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('update-status')
    @Roles(Role.Staff)
    updateOrderStatus(@GetUser() user: User) {
        return this.orderService.updateKenoOrderStatus(user)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('lock')
    @Roles(Role.Staff)
    lockOrder(@GetUser() user: User, @Body() body: lockMultiOrderDTO) {
        return this.orderService.lockOrder(user, body)
    }
}
