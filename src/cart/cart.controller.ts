import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { Lottery, Order, User, NumberLottery, Cart } from '../../node_modules/.prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { CreateOrderKenoDTO, CreateOrderMax3dDTO, CreateOrderMegaPowerDTO } from 'src/order/dto';
import { CartService } from './cart.service';
import { DeleteLotteryCartDTO, DeleteNumberLotteryDTO } from './dto';

@Controller('cart')
export class CartController {
    constructor(private cartService: CartService) { }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('add-power-mega')
    @Roles(Role.User)
    addLotteryPowerMega(@GetUser() user: User, @Body() body: CreateOrderMegaPowerDTO): Promise<Lottery> {
        return this.cartService.addLotteryPowerMega(user, body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('list')
    @Roles(Role.User)
    getListLotteryInCart(@GetUser() user: User): Promise<Lottery[]> {
        return this.cartService.getLotteryFromCart(user)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('delete')
    @Roles(Role.User)
    deleteOrderInCart(@GetUser() user: User, @Body() body: DeleteLotteryCartDTO) {
        const { lotteryId } = body;
        return this.cartService.deleteLottery(user, lotteryId)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('delete-number')
    @Roles(Role.User)
    deleteNumber(@GetUser() user: User, @Body() body: DeleteNumberLotteryDTO) {
        return this.cartService.deleteNumber(user, body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('empty')
    @Roles(Role.User)
    deleteAllLottery(@GetUser() user: User): any {
        return this.cartService.deleteAllLottery(user)
    }

    // @UseGuards(MyJwtGuard, RolesGuard)
    // @Post('add-keno')
    // @Roles(Role.User)
    // addOderKeno(@GetUser() user: User, @Body() body: CreateOrderKenoDTO): Promise<Order> {
    //     return this.cartService.addOrderKeno(user, body)
    // }

    // @UseGuards(MyJwtGuard, RolesGuard)
    // @Post('add-max3d')
    // @Roles(Role.User)
    // addOrderMax3d(@GetUser() user: User, @Body() body: CreateOrderMax3dDTO): Promise<Order> {
    //     return this.cartService.addOrderPowerMax3d(user, body)
    // }

    // @UseGuards(MyJwtGuard, RolesGuard)
    // @Get('list')
    // @Roles(Role.User)
    // getListOrderInCart(@GetUser() user: User): Promise<Order[]> {
    //     return this.cartService.getListOrderInCart(user)
    // }

    // @UseGuards(MyJwtGuard, RolesGuard)
    // @Post('delete')
    // @Roles(Role.User)
    // deleteOrderInCart(@GetUser() user: User, @Body() body: DeleteOrderCartDTO) {
    //     return this.cartService.deleteOrder(user, body)
    // }

    // @UseGuards(MyJwtGuard, RolesGuard)
    // @Post('buy')
    // @Roles(Role.User)
    // buyOrderInCart(@GetUser() user: User, @Body() body: DeleteOrderCartDTO): Promise<Order> {
    //     return this.cartService.buyOrderCart(user, body)
    // }
}
