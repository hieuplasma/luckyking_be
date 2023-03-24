import { ForbiddenException, Injectable } from '@nestjs/common';
import { Order, OrderStatus, User } from '../../node_modules/.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfirmOrderDTO, CreateOrderKenoDTO, CreateOrderMax3dDTO, CreateOrderMegaPowerDTO, ReturnOrderDTO } from './dto';
import { Role } from 'src/common/enum';
import { LotteryNumber, NumberDetail } from '../common/entity';
import { caculateSurcharge } from 'src/common/utils';
import { UserService } from 'src/user/user.service';
import { LUCKY_KING_PAYMENT } from 'src/common/constants';
import { TransactionService } from 'src/transaction/transaction.service';

@Injectable()
export class OrderService {
    constructor(
        private prismaService: PrismaService,
        private userService: UserService,
        private transactionService: TransactionService
    ) { }

    async createOrderPowerMega(user: User, body: CreateOrderMegaPowerDTO): Promise<Order> {
        const balances = await this.userService.getAllWallet(user.id)
        const amount = parseInt(body.amount.toString())
        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(amount)
        if (body.status != OrderStatus.CART) {
            if ((amount % 1000) != 0) { throw new ForbiddenException("The amount must be a multiple of 1000") }
            if (balances.luckykingBalance < amount + surcharge) { throw new ForbiddenException("The balance is not enough") }
        }
        let currentDate = new Date()
        let list = new LotteryNumber()
        body.numbers.map(item => {
            list.add(new NumberDetail(item, "0"))
        })
        const order = await this.prismaService.order.create({
            data: {
                amount: amount,
                user: {
                    connect: { id: user.id }
                },
                //@ts-ignore
                status: body.status ? body.status : OrderStatus.PENDING,
                dataPart: "" + currentDate.getDate() + (currentDate.getMonth() + 1) + currentDate.getFullYear(),
                method: body.method,
                surcharge: surcharge,
                Lottery: {
                    create: {
                        userId: user.id,
                        type: body.lotteryType,
                        bets: amount,
                        //@ts-ignore
                        status: body.status ? body.status : OrderStatus.PENDING,
                        drawCode: parseInt(body.drawCode.toString()),
                        drawTime: new Date(Date.now() + (3600 * 1000 * 24)),
                        NumberLottery: {
                            create: {
                                level: parseInt(body.level.toString()),
                                numberSets: body.numbers.length,
                                numberDetail: list.convertToJSon()
                            }
                        }
                    }
                },
            },
            include: { Lottery: { include: { NumberLottery: true } } }
        })
        return order
    }

    async createOrderMax3d(user: User, body: CreateOrderMax3dDTO): Promise<Order> {
        const balances = await this.userService.getAllWallet(user.id)
        const amount = parseInt(body.amount.toString())
        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(amount)
        if (body.status != OrderStatus.CART) {
            if ((amount % 1000) != 0) { throw new ForbiddenException("The amount must be a multiple of 1000") }
            if (balances.luckykingBalance < amount + surcharge) { throw new ForbiddenException("The balance is not enough") }
        }
        let currentDate = new Date()
        let list = new LotteryNumber()
        for (let i = 0; i < body.numbers.length; i++) {
            await list.add(new NumberDetail(body.numbers[i], body.bets[i]))
        }
        const order = await this.prismaService.order.create({
            data: {
                amount: amount,
                user: {
                    connect: { id: user.id }
                },
                //@ts-ignore
                status: body.status ? body.status : OrderStatus.PENDING,
                dataPart: "" + currentDate.getDate() + (currentDate.getMonth() + 1) + currentDate.getFullYear(),
                method: body.method,
                surcharge: surcharge,
                Lottery: {
                    create: {
                        userId: user.id,
                        type: body.lotteryType,
                        bets: amount,
                        //@ts-ignore
                        status: body.status ? body.status : OrderStatus.PENDING,
                        drawCode: parseInt(body.drawCode.toString()),
                        drawTime: new Date(Date.now() + (3600 * 1000 * 24)),
                        NumberLottery: {
                            create: {
                                level: parseInt(body.level.toString()),
                                numberSets: body.numbers.length,
                                numberDetail: list.convertToJSon()
                            }
                        }
                    }
                }
            },
            include: { Lottery: { include: { NumberLottery: true } } }
        })
        return order
    }

    async createOrderKeno(user: User, body: CreateOrderKenoDTO): Promise<Order> {
        const balances = await this.userService.getAllWallet(user.id)
        const amount = parseInt(body.amount.toString())
        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(amount)
        if (body.status != OrderStatus.CART) {
            if ((amount % 1000) != 0) { throw new ForbiddenException("The amount must be a multiple of 1000") }
            if (balances.luckykingBalance < amount + surcharge) { throw new ForbiddenException("The balance is not enough") }
        }
        let currentDate = new Date()
        let list = new LotteryNumber()
        for (let i = 0; i < body.numbers.length; i++) {
            await list.add(new NumberDetail(body.numbers[i], body.bets[i]))
        }
        const order = await this.prismaService.order.create({
            data: {
                amount: amount,
                user: {
                    connect: { id: user.id }
                },
                //@ts-ignore
                status: body.status ? body.status : OrderStatus.PENDING,
                dataPart: "" + currentDate.getDate() + (currentDate.getMonth() + 1) + currentDate.getFullYear(),
                method: body.method,
                surcharge: surcharge,
                Lottery: {
                    create: {
                        userId: user.id,
                        type: body.lotteryType,
                        bets: amount,
                        //@ts-ignore
                        status: body.status ? body.status : OrderStatus.PENDING,
                        drawCode: parseInt(body.drawCode.toString()),
                        drawTime: new Date(Date.now() + (3600 * 1000 * 24)),
                        NumberLottery: {
                            create: {
                                level: parseInt(body.level.toString()),
                                numberSets: body.numbers.length,
                                numberDetail: list.convertToJSon()
                            }
                        }
                    }
                },
                Cart: { connect: { id: body.cartId ? body.cartId : null } }
            },
            include: { Lottery: { include: { NumberLottery: true } } }
        })
        return order
    }

    async getOrderById(orderId: string): Promise<Order> {
        console.log(orderId)
        const order = await this.prismaService.order.findUnique({
            where: { id: orderId },
            include: { Lottery: { include: { NumberLottery: true } }, user: true }
        })
        return order
    }

    async getListOrder(me: User, status: keyof typeof OrderStatus): Promise<Order[]> {
        const orders = await this.prismaService.order.findMany({
            where: { AND: { userId: me.id, status: status } },
            include: { Lottery: { include: { NumberLottery: true } } }
        })
        return orders
    }

    async getAllPendingOrder(): Promise<Order[]> {
        const orders = await this.prismaService.order.findMany({
            where: { status: OrderStatus.PENDING },
            include: { Lottery: { include: { NumberLottery: true } } }
        })
        return orders
    }

    async returnOrder(user: User, body: ReturnOrderDTO): Promise<Order> {
        const order = await this.prismaService.order.findUnique({
            where: { id: body.orderId }
        })
        if (order.status != OrderStatus.PENDING) { throw new ForbiddenException("Order is aleady resolved!") }

        const newStatus = body.status ? body.status : OrderStatus.RETURNED
        let confirmBy = ""
        if (user.role == Role.Staff) confirmBy = user.address + " - " + user.personNumber
        const returnedOrder = await this.prismaService.order.update({
            data: {
                status: newStatus,
                statusDescription: body.description,
                confirmAt: new Date(),
                confirmBy: confirmBy,
                confrimUserId: user.id,
            },
            where: { id: body.orderId },
            include: { Lottery: true }
        })
        await this.prismaService.$transaction(
            returnedOrder.Lottery.map((child) =>
                this.prismaService.lottery.update({
                    where: { id: child.id },
                    data: { status: newStatus },
                })
            )
        )
        return returnedOrder
    }

    async confirmOrder(user: User, body: ConfirmOrderDTO): Promise<Order> {
        const order = await this.prismaService.order.findUnique({
            where: { id: body.orderId },
            include: { user: true, Lottery: true }
        })
        if (order.status != OrderStatus.PENDING) { throw new ForbiddenException("Order is aleady resolved!") }

        const newStatus = body.status ? body.status : OrderStatus.CONFIRMED
        const payment = body.payment || LUCKY_KING_PAYMENT
        let confirmBy = ""
        if (user.role == Role.Staff) confirmBy = user.address + " - " + user.personNumber

        order.Lottery.map(item => {
            if (!(item.imageBack || item.imageFront)) { throw new ForbiddenException("All lotteries must have image!") }
        })

        const transaction = await this.transactionService.payForOrder(
            order.user,
            order.amount + order.surcharge,
            payment,
            "Ví LuckyKing",
            "Ví của nhà phát triển",
            user.id
        )

        const orderConfirmed = await this.prismaService.order.update({
            data: {
                status: newStatus,
                statusDescription: body.description,
                confirmAt: new Date(),
                confirmBy: confirmBy,
                confrimUserId: user.id,
                payment: payment,
                tradingCode: transaction.id
            },
            where: { id: body.orderId },
            include: { Lottery: { include: { NumberLottery: true } } }
        })
        await this.prismaService.$transaction(
            orderConfirmed.Lottery.map((child) =>
                this.prismaService.lottery.update({
                    where: { id: child.id },
                    data: { status: newStatus },
                })
            )
        )
        //@ts-ignore
        orderConfirmed.transaction = transaction
        return orderConfirmed
    }
}

