import { ForbiddenException, Injectable } from '@nestjs/common';
import { Lottery, Order, OrderStatus, User } from '@prisma/client';
import { LotteryNumber, NumberDetail } from 'src/common/entity';
import { LotteryType } from 'src/common/enum';
import { nDate } from 'src/common/utils';
import { CreateOrderKenoDTO, CreateOrderMax3dDTO, CreateOrderMegaPowerDTO } from 'src/order/dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { DeleteLotteryCartDTO } from './dto';

@Injectable()
export class CartService {
    constructor(
        private prismaService: PrismaService,
        private userService: UserService
    ) { }

    async addLotteryPowerMega(user: User, body: CreateOrderMegaPowerDTO) {
        const status = OrderStatus.CART
        const cartId = await this.getCardId(user.id)
        let list = new LotteryNumber()
        body.numbers.map((item: any) => {
            list.add(new NumberDetail(item, "0"))
        })
        const lottery = await this.prismaService.lottery.create({
            data: {
                user: {
                    connect: { id: user.id }
                },
                type: body.lotteryType,
                bets: parseInt(body.amount.toString()),
                status: status,
                drawCode: parseInt(body.drawCode.toString()),
                NumberLottery: {
                    create: {
                        level: parseInt(body.level.toString()),
                        numberSets: body.numbers.length,
                        numberDetail: list.convertToJSon()
                    }
                },
                Cart: {
                    connect: { id: cartId }
                }
            }
        })
        return lottery
    }

    async getLotteryFromCart(user: User): Promise<Lottery[]> {
        const cartId = await this.getCardId(user.id)
        const list = await this.prismaService.lottery.findMany({
            where: { cartId: cartId, status: OrderStatus.CART },
            include: { NumberLottery: true }
        })
        return list
    }

    async deleteLottery(user: User, body: DeleteLotteryCartDTO) {
        const find = await this.prismaService.lottery.findUnique({ where: { id: body.lotteryId } })
        if (!find) throw new ForbiddenException("Record to delete does not exist")
        const del = await this.prismaService.lottery.delete({
            where: { id: body.lotteryId }
        })
        return del
    }



    // async addOrderPowerMega(user: User, body: CreateOrderMegaPowerDTO) {
    //     body.status = OrderStatus.CART
    //     body.cartId = await this.getCardId(user.id)
    //     return this.orderService.createOrderPowerMega(user, body)
    // }

    // async addOrderKeno(user: User, body: CreateOrderKenoDTO) {
    //     body.status = OrderStatus.CART
    //     body.cartId = await this.getCardId(user.id)
    //     return this.orderService.createOrderKeno(user, body)
    // }

    // async addOrderPowerMax3d(user: User, body: CreateOrderMax3dDTO) {
    //     body.status = OrderStatus.CART
    //     body.cartId = await this.getCardId(user.id)
    //     return this.orderService.createOrderMax3d(user, body)
    // }

    // async getListOrderInCart(user: User): Promise<Order[]> {
    //     const cartId = await this.getCardId(user.id)
    //     const list = await this.prismaService.order.findMany({
    //         where: { cartId: cartId, status: OrderStatus.CART },
    //         include: { Lottery: { include: { NumberLottery: true } } }
    //     })
    //     return list
    // }

    // async deleteOrder(user: User, body: DeleteOrderCartDTO) {
    //     const find = await this.prismaService.order.findUnique({ where: { id: body.orderId } })
    //     if (!find) throw new ForbiddenException("Record to delete does not exist")
    //     const del = await this.prismaService.order.delete({
    //         where: { id: body.orderId }
    //     })
    //     return del
    // }

    // async buyOrderCart(user: User, body: DeleteOrderCartDTO) {
    //     const balance = (await this.userService.getAllWallet(user.id)).luckykingBalance
    //     const order = await this.orderService.getOrderById(body.orderId)
    //     if ((order.amount % 1000) != 0) { throw new ForbiddenException("The amount must be a multiple of 1000") }
    //     if (balance < order.amount + order.surcharge) { throw new ForbiddenException("The balance is not enough") }
    //     const now = new nDate()
    //     const update = await this.prismaService.order.update({
    //         where: { id: body.orderId },
    //         data: {
    //             status: OrderStatus.PENDING,
    //             Cart: { disconnect: true },
    //             creataAt: now
    //         },
    //         include: { Lottery: true }
    //     })
    //     await this.prismaService.$transaction(
    //         update.Lottery.map((child) =>
    //             this.prismaService.lottery.update({
    //                 where: { id: child.id },
    //                 data: { status: OrderStatus.PENDING, buyTime: now },
    //             })
    //         )
    //     )
    //     return update
    // }

    private async getCardId(userId: string) {
        const cart = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { Cart: true },
        })
        return cart.Cart.id
    }
}
