import { ForbiddenException, Injectable } from '@nestjs/common';
import { Lottery, Order, OrderStatus, User } from '../../node_modules/.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfirmOrderDTO, CreateOrderKenoDTO, CreateOrderMax3dDTO, CreateOrderMegaPowerDTO, ReturnOrderDTO } from './dto';
import { OrderMethod, Role } from 'src/common/enum';
import { LotteryNumber, NumberDetail } from '../common/entity';
import { caculateSurcharge, nDate } from 'src/common/utils';
import { UserService } from 'src/user/user.service';
import { DEFAULT_BET, LUCKY_KING_PAYMENT } from 'src/common/constants';
import { TransactionService } from 'src/transaction/transaction.service';
import { LotteryService } from 'src/lottery/lottery.service';
import { ICreateLottery } from 'src/lottery/interfaces';

@Injectable()
export class OrderService {
    constructor(
        private prismaService: PrismaService,
        private userService: UserService,
        private transactionService: TransactionService,
        private lotteryService: LotteryService
    ) { }

    async createOrderPowerMega(user: User, body: CreateOrderMegaPowerDTO): Promise<Order> {
        const balances = await this.userService.getAllWallet(user.id)
        const { drawCode, drawTime, lotteryType, lotteryId } = body;
        const cartId = await this.getCardId(user.id);

        let currentDate = new nDate()
        let list = new LotteryNumber()
        let amount = 0;

        for (const item of body.numbers) {
            list.add(new NumberDetail(item, DEFAULT_BET));
            amount += DEFAULT_BET;
        }

        amount *= drawCode.length;

        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(amount);

        if (body.status !== OrderStatus.CART) {
            if (balances.luckykingBalance < amount + surcharge) { throw new ForbiddenException("The balance is not enough") }
        }

        const transaction = await this.transactionService.payForOrder(
            user,
            amount + surcharge,
            LUCKY_KING_PAYMENT,
            "Ví LuckyKing",
            "Ví của nhà phát triển",
            user.id
        )

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
                tradingCode: transaction.id,
                Lottery: {
                    create: {
                        userId: user.id,
                        type: body.lotteryType,
                        amount,
                        //@ts-ignore
                        status: body.status ? body.status : OrderStatus.PENDING,
                        drawCode: parseInt(body.drawCode.toString()),
                        drawTime: body.drawTime,
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
        //@ts-ignore
        order.transaction = transaction
        return order
    }

    async createOrderMax3d(user: User, body: CreateOrderMax3dDTO): Promise<Order> {
        const balances = await this.userService.getAllWallet(user.id)
        const { drawCode, drawTime, lotteryType, lotteryId, bets } = body;
        const cartId = await this.getCardId(user.id);

        let currentDate = new nDate()
        let list = new LotteryNumber()
        let amount = 0;

        for (let i = 0; i < body.numbers.length; i++) {
            list.add(new NumberDetail(body.numbers[i], parseInt(body.bets[i]) || DEFAULT_BET));
            amount += parseInt(body.bets[i]) || DEFAULT_BET;
        }

        amount *= drawCode.length;

        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(amount)

        if (body.status !== OrderStatus.CART) {
            if (balances.luckykingBalance < amount + surcharge) { throw new ForbiddenException("The balance is not enough") }
        }

        const transaction = await this.transactionService.payForOrder(
            user,
            amount + surcharge,
            LUCKY_KING_PAYMENT,
            "Ví LuckyKing",
            "Ví của nhà phát triển",
            user.id
        )

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
                tradingCode: transaction.id,
                Lottery: {
                    create: {
                        userId: user.id,
                        type: body.lotteryType,
                        amount,
                        bets,
                        //@ts-ignore
                        status: body.status ? body.status : OrderStatus.PENDING,
                        drawCode: parseInt(body.drawCode.toString()),
                        drawTime: body.drawTime,
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
        //@ts-ignore
        order.transaction = transaction
        return order
    }

    async createOrderKeno(user: User, body: CreateOrderKenoDTO): Promise<Order> {
        const balances = await this.userService.getAllWallet(user.id)
        const { drawCode, drawTime, lotteryType } = body;
        const cartId = await this.getCardId(user.id);

        let currentDate = new nDate()
        let list = new LotteryNumber()
        let amount = 0;

        for (let i = 0; i < body.numbers.length; i++) {
            list.add(new NumberDetail(body.numbers[i], parseInt(body.bets[i]) || DEFAULT_BET));
            amount += parseInt(body.bets[i]) || DEFAULT_BET;
        }

        amount *= drawCode.length;

        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(amount)

        if (body.status !== OrderStatus.CART) {
            if (balances.luckykingBalance < amount + surcharge) { throw new ForbiddenException("The balance is not enough") }
        }

        const transaction = await this.transactionService.payForOrder(
            user,
            amount + surcharge,
            LUCKY_KING_PAYMENT,
            "Ví LuckyKing",
            "Ví của nhà phát triển",
            user.id
        )

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
                tradingCode: transaction.id,
                Lottery: {
                    create: {
                        userId: user.id,
                        type: lotteryType,
                        amount,
                        //@ts-ignore
                        status: body.status ? body.status : OrderStatus.PENDING,
                        drawCode: parseInt(body.drawCode.toString()),
                        drawTime: drawTime,
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
        //@ts-ignore
        order.transaction = transaction
        return order
    }

    async createOrderFromCart(user: User, lotteryIds: string[], method: keyof typeof OrderMethod) {
        let totalAmount = 0;
        const lotteryIdsToCreate = []; // Only create lottery with status as cart

        for (const lotteryId of lotteryIds) {
            const lottery = await this.lotteryService.getLotteryById(lotteryId);
            if (!lottery || lottery.status !== OrderStatus.CART) continue;

            lotteryIdsToCreate.push(lotteryId);

            const { amount } = lottery;
            totalAmount += amount;
        }

        if (lotteryIdsToCreate.length === 0) throw new ForbiddenException("No lottery to order");

        const surcharge = caculateSurcharge(totalAmount);
        const totalMoney = totalAmount + surcharge;

        const balances = await this.userService.getAllWallet(user.id);

        if (totalMoney > balances.luckykingBalance) {
            throw new ForbiddenException("The balance is not enough");
        }

        let order: Order;   // Will add $transaction in a future
        // await this.prismaService.$transaction(async (tx) => {
        const transaction = await this.transactionService.payForOrder(
            user,
            totalMoney,
            LUCKY_KING_PAYMENT,
            "Ví LuckyKing",
            "Ví của nhà phát triển",
            user.id
        )

        const currentDate = new nDate()

        order = await this.prismaService.order.create({
            data: {
                amount: totalAmount,
                user: {
                    connect: { id: user.id }
                },
                //@ts-ignore
                status: OrderStatus.PENDING,
                dataPart: "" + currentDate.getDate() + (currentDate.getMonth() + 1) + currentDate.getFullYear(),
                method: method || OrderMethod.Keep,
                surcharge: surcharge,
                tradingCode: transaction.id,
            }
        });

        for (const lotteryId of lotteryIdsToCreate) {
            await this.lotteryService.createLotteryFromCart(user, lotteryId, order.id);
        }
        // )}
        return order;
    }

    async getOrderById(orderId: string): Promise<Order> {
        const order = await this.prismaService.order.findUnique({
            where: { id: orderId },
            include: { Lottery: { include: { NumberLottery: true } }, user: true }
        })
        return order
    }

    async getListOrderByUser(me: User, status: keyof typeof OrderStatus): Promise<Order[]> {
        const orders = await this.prismaService.order.findMany({
            where: { AND: { userId: me.id, status: status } },
            include: { Lottery: { include: { NumberLottery: true } } }
        })
        return orders
    }

    async getAllOrder(status: keyof typeof OrderStatus): Promise<Order[]> {
        const query: { [key: string]: string } = {};

        if (status) {
            query.status = status;
        }

        const orders = await this.prismaService.order.findMany({
            where: query,
            include: { Lottery: { include: { NumberLottery: true } }, user: true }
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
                confirmAt: new nDate(),
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
        // const payment = body.payment || LUCKY_KING_PAYMENT
        let confirmBy = ""
        if (user.role == Role.Staff) confirmBy = user.address + " - " + user.personNumber

        order.Lottery.map(item => {
            if (!(item.imageBack || item.imageFront)) { throw new ForbiddenException("All lotteries must have image!") }
        })

        // const transaction = await this.transactionService.payForOrder(
        //     order.user,
        //     order.amount + order.surcharge,
        //     payment,
        //     "Ví LuckyKing",
        //     "Ví của nhà phát triển",
        //     user.id
        // )

        const orderConfirmed = await this.prismaService.order.update({
            data: {
                status: newStatus,
                statusDescription: body.description,
                confirmAt: new nDate(),
                confirmBy: confirmBy,
                confrimUserId: user.id,
                // payment: payment,
                // tradingCode: transaction.id
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
        // orderConfirmed.transaction = transaction
        return orderConfirmed
    }

    private async getCardId(userId: string) {
        const cart = await this.prismaService.user.findUnique({
            where: { id: userId },
            select: { Cart: true },
        })
        return cart.Cart.id
    }
}

