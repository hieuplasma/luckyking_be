import { ForbiddenException, Injectable } from '@nestjs/common';
import { Order, OrderStatus, User } from '../../node_modules/.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfirmOrderDTO, CreateOrderKenoDTO, CreateOrderMax3dDTO, CreateOrderMegaPowerDTO, lockMultiOrderDTO, OrderByDrawDTO, ReturnOrderDTO } from './dto';
import { LotteryType, OrderMethod, Role, TransactionDestination } from 'src/common/enum';
import { LotteryNumber, NumberDetail } from '../common/entity';
import { caculateSurcharge, nDate } from 'src/common/utils';
import { UserService } from 'src/user/user.service';
import { DEFAULT_BET, LUCKY_KING_PAYMENT } from 'src/common/constants';
import { TransactionService } from 'src/transaction/transaction.service';
import { LotteryService } from 'src/lottery/lottery.service';
import { FIREBASE_MESSAGE, FIREBASE_TITLE, TIME_TO_HANDLE_LOTTERY } from 'src/common/constants/constants';
import FirebaseService from '../firebase/firebase-app'
import { KenoSocketService } from 'src/webSocket/kenoWebSocket.service';
import { printCode } from 'src/common/utils/other.utils';


@Injectable()
export class OrderService {
    constructor(
        private prismaService: PrismaService,
        private userService: UserService,
        private transactionService: TransactionService,
        private lotteryService: LotteryService,
        private kenoSocketService: KenoSocketService,
        private firebaseService: FirebaseService,
    ) { }

    async createOrderPowerMega(user: User, body: CreateOrderMegaPowerDTO): Promise<Order> {
        const balances = await this.userService.getAllWallet(user.id)
        const { drawCode, drawTime, bets, lotteryType } = body;

        const currentDate = new nDate()
        let totalAmount = 0;

        const numbers = [...body.numbers];
        const setOfNumbers = [];
        let i = 0;

        while (numbers.length) {
            setOfNumbers[i] = setOfNumbers[i] ? setOfNumbers[i] : [];
            setOfNumbers[i].push(numbers.shift())
            if (setOfNumbers[i].length === 6) i++;
        }

        const lotteries = [];

        for (const lotteryNumbers of setOfNumbers) {
            let amount = 0;
            let list = new LotteryNumber();

            for (let i = 0; i < lotteryNumbers.length; i++) {
                list.add(new NumberDetail(lotteryNumbers[i], parseInt(bets[i]) || DEFAULT_BET));
                amount += parseInt(bets[i]) || DEFAULT_BET;
            }

            for (let i = 0; i < drawCode.length; i++) {
                totalAmount += amount;

                const lottery = {
                    user: {
                        connect: { id: user.id }
                    },
                    type: lotteryType,
                    amount,
                    bets,
                    //@ts-ignore
                    status: body.status ? body.status : OrderStatus.PENDING,
                    drawCode: drawCode[i],
                    drawTime: drawTime[i],
                    NumberLottery: {
                        create: {
                            level: parseInt(body.level.toString()),
                            numberSets: lotteryNumbers.length,
                            numberDetail: list.convertToJSon()
                        }
                    }
                }

                lotteries.push(lottery)
            }
        }

        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(totalAmount)
        if (body.status !== OrderStatus.CART) {
            if (balances.luckykingBalance < totalAmount + surcharge) { throw new ForbiddenException("The balance is not enough") }
        }

        let order: Order;

        await this.prismaService.$transaction(async (tx) => {
            const transaction = await this.transactionService.payForOrder(
                user,
                totalAmount + surcharge,
                LUCKY_KING_PAYMENT,
                TransactionDestination.LUCKY_KING,
                TransactionDestination.HOST,
                user.id,
                tx
            )

            order = await tx.order.create({
                data: {
                    amount: totalAmount,
                    user: {
                        connect: { id: user.id }
                    },
                    //@ts-ignore
                    status: body.status ? body.status : OrderStatus.PENDING,
                    dataPart: "" + currentDate.getDate() + (currentDate.getMonth() + 1) + currentDate.getFullYear(),
                    method: body.method,
                    surcharge: surcharge,
                    tradingCode: transaction.id,
                },
                include: { Lottery: { include: { NumberLottery: true } } }
            })

            const lotteryToReturn = []
            for (const lotteryData of lotteries) {
                const lottery = await tx.lottery.create({
                    data: {
                        ...lotteryData,
                        Order: {
                            connect: { id: order.id }
                        }
                    },
                    include: { NumberLottery: true }
                })

                lotteryToReturn.push(lottery)
            }

            //@ts-ignore
            order.transaction = transaction;
            //@ts-ignore
            order.Lottery = lotteryToReturn;

        })

        this.firebaseService.sendNotification('Có đơn PowerMega mới');
        await this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.ORDER_SUCCESS,
            FIREBASE_MESSAGE.ORDER_SUCCESS
                .replace('ma_don_hang', printCode(order.displayId))
                .replace('so_tien', totalAmount.toString())
        )

        return order
    }

    async createOrderMax3d(user: User, body: CreateOrderMax3dDTO): Promise<Order> {
        const balances = await this.userService.getAllWallet(user.id)
        const { drawCode, drawTime, lotteryType } = body;

        const currentDate = new nDate()
        let totalAmount = 0;

        const numbers = [...body.numbers];
        const setOfNumbers = [];
        const bets = [...body.bets];
        const setOfBets = [];

        let i = 0;

        while (numbers.length) {
            setOfNumbers[i] = setOfNumbers[i] ? setOfNumbers[i] : [];
            setOfNumbers[i].push(numbers.shift())

            setOfBets[i] = setOfBets[i] ? setOfBets[i] : [];
            setOfBets[i].push(bets.shift())

            if (setOfNumbers[i].length === 6) i++;
        }

        const lotteries = [];

        for (let j = 0; j < setOfNumbers.length; j++) {
            let amount = 0;
            let list = new LotteryNumber();

            for (let i = 0; i < setOfNumbers[j].length; i++) {
                list.add(new NumberDetail(setOfNumbers[j][i], parseInt(setOfBets[j][i]) || DEFAULT_BET));
                amount += parseInt(setOfBets[j][i]) || DEFAULT_BET;
            }

            for (let i = 0; i < drawCode.length; i++) {
                totalAmount += amount;

                const lottery = {
                    user: {
                        connect: { id: user.id }
                    },
                    type: lotteryType,
                    amount,
                    bets: setOfBets[j],
                    //@ts-ignore
                    status: body.status ? body.status : OrderStatus.PENDING,
                    drawCode: drawCode[i],
                    drawTime: drawTime[i],
                    NumberLottery: {
                        create: {
                            level: parseInt(body.level.toString()),
                            numberSets: setOfNumbers[j].length,
                            numberDetail: list.convertToJSon()
                        }
                    }
                }

                lotteries.push(lottery)
            }
        }

        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(totalAmount)
        if (body.status !== OrderStatus.CART) {
            if (balances.luckykingBalance < totalAmount + surcharge) { throw new ForbiddenException("The balance is not enough") }
        }

        let order: Order;

        await this.prismaService.$transaction(async (tx) => {
            const transaction = await this.transactionService.payForOrder(
                user,
                totalAmount + surcharge,
                LUCKY_KING_PAYMENT,
                TransactionDestination.LUCKY_KING,
                TransactionDestination.HOST,
                user.id,
                tx
            )

            order = await tx.order.create({
                data: {
                    amount: totalAmount,
                    user: {
                        connect: { id: user.id }
                    },
                    //@ts-ignore
                    status: body.status ? body.status : OrderStatus.PENDING,
                    dataPart: "" + currentDate.getDate() + (currentDate.getMonth() + 1) + currentDate.getFullYear(),
                    method: body.method,
                    surcharge: surcharge,
                    tradingCode: transaction.id,
                },
                include: { Lottery: { include: { NumberLottery: true } } }
            })

            const lotteryToReturn = []
            for (const lotteryData of lotteries) {
                const lottery = await tx.lottery.create({
                    data: {
                        ...lotteryData,
                        Order: {
                            connect: { id: order.id }
                        }
                    },
                    include: { NumberLottery: true }
                })

                lotteryToReturn.push(lottery)
            }

            //@ts-ignore
            order.transaction = transaction;
            //@ts-ignore
            order.Lottery = lotteryToReturn;
        })


        this.firebaseService.sendNotification('Có đơn max3D mới');
        await this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.ORDER_SUCCESS,
            FIREBASE_MESSAGE.ORDER_SUCCESS
                .replace('ma_don_hang', printCode(order.displayId))
                .replace('so_tien', totalAmount.toString())
        )

        return order
    }

    async createOrderKeno(user: User, body: CreateOrderKenoDTO): Promise<Order> {
        const balances = await this.userService.getAllWallet(user.id)
        const { drawCode, drawTime, lotteryType } = body;

        const currentDate = new nDate()
        let totalAmount = 0;

        const numbers = [...body.numbers];
        const setOfNumbers = [];
        const bets = [...body.bets];
        const setOfBets = [];

        let i = 0;

        while (numbers.length) {
            setOfNumbers[i] = setOfNumbers[i] ? setOfNumbers[i] : [];
            setOfNumbers[i].push(numbers.shift())

            setOfBets[i] = setOfBets[i] ? setOfBets[i] : [];
            setOfBets[i].push(bets.shift())

            if (setOfNumbers[i].length === 6) i++;
        }

        const lotteries = [];

        for (let j = 0; j < setOfNumbers.length; j++) {
            let amount = 0;
            let list = new LotteryNumber();

            for (let i = 0; i < setOfNumbers[j].length; i++) {
                list.add(new NumberDetail(setOfNumbers[j][i], parseInt(setOfBets[j][i]) || DEFAULT_BET));
                amount += parseInt(setOfBets[j][i]) || DEFAULT_BET;
            }

            for (let i = 0; i < drawCode.length; i++) {
                totalAmount += amount;

                const lottery = {
                    user: {
                        connect: { id: user.id }
                    },
                    type: lotteryType,
                    amount,
                    bets: setOfBets[j],
                    //@ts-ignore
                    status: body.status ? body.status : OrderStatus.PENDING,
                    drawCode: drawCode[i],
                    drawTime: drawTime[i],
                    NumberLottery: {
                        create: {
                            level: parseInt(body.level.toString()),
                            numberSets: setOfNumbers[j].length,
                            numberDetail: list.convertToJSon()
                        }
                    }
                }

                lotteries.push(lottery)
            }

        }

        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(totalAmount)
        if (body.status !== OrderStatus.CART) {
            if (balances.luckykingBalance < totalAmount + surcharge) { throw new ForbiddenException("The balance is not enough") }
        }


        let order: Order;

        await this.prismaService.$transaction(async (tx) => {
            const transaction = await this.transactionService.payForOrder(
                user,
                totalAmount + surcharge,
                LUCKY_KING_PAYMENT,
                TransactionDestination.LUCKY_KING,
                TransactionDestination.HOST,
                user.id,
                tx
            )

            order = await tx.order.create({
                data: {
                    amount: totalAmount,
                    user: {
                        connect: { id: user.id }
                    },
                    //@ts-ignore
                    status: body.status ? body.status : OrderStatus.PENDING,
                    ticketType: "keno",
                    dataPart: "" + currentDate.getDate() + (currentDate.getMonth() + 1) + currentDate.getFullYear(),
                    method: body.method,
                    surcharge: surcharge,
                    tradingCode: transaction.id,
                },
                include: { Lottery: { include: { NumberLottery: true } } }
            })

            const lotteryToReturn = []
            for (const lotteryData of lotteries) {
                const lottery = await tx.lottery.create({
                    data: {
                        ...lotteryData,
                        Order: {
                            connect: { id: order.id }
                        }
                    },
                    include: { NumberLottery: true }
                })

                lotteryToReturn.push(lottery)
            }

            //@ts-ignore
            order.transaction = transaction;
            //@ts-ignore
            order.Lottery = lotteryToReturn;
        });


        const now = new nDate()
        const schedule = await this.prismaService.resultKeno.findFirst({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
        });

        // @ts-ignore
        let lotteriesToSend = order.Lottery.filter((lottery) => lottery.drawCode === schedule.drawCode);
        lotteriesToSend.map((lottery: any) => lottery.Order = { displayId: order.displayId })
        if (lotteriesToSend.length) {
            this.firebaseService.sendNotification('Có đơn keno mới');
            this.kenoSocketService.sendKenoLottery(lotteriesToSend);
        }

        await this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.ORDER_SUCCESS,
            FIREBASE_MESSAGE.ORDER_SUCCESS
                .replace('ma_don_hang', printCode(order.displayId))
                .replace('so_tien', totalAmount.toString())
        )

        return order;
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

        let order: Order;

        await this.prismaService.$transaction(async (tx) => {
            const transaction = await this.transactionService.payForOrder(
                user,
                totalMoney,
                LUCKY_KING_PAYMENT,
                TransactionDestination.LUCKY_KING,
                TransactionDestination.HOST,
                user.id,
                tx
            )

            const currentDate = new nDate()

            order = await tx.order.create({
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
                await this.lotteryService.createLotteryFromCart(user, lotteryId, order.id, tx);
            }
        })

        this.firebaseService.sendNotification('Có đơn vé thường mới');
        await this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.ORDER_SUCCESS,
            FIREBASE_MESSAGE.ORDER_SUCCESS
                .replace('ma_don_hang', printCode(order.displayId))
                .replace('so_tien', totalAmount.toString())
        )

        return order;
    }

    async getOrderById(orderId: string): Promise<Order> {
        const order = await this.prismaService.order.findUnique({
            where: { id: orderId },
            include: { Lottery: { include: { NumberLottery: true } }, user: true }
        })
        return order
    }

    async getOrderByDisplayId(displayId: number): Promise<Order> {
        const order = await this.prismaService.order.findFirst({
            where: { displayId: displayId },
            include: { Lottery: { include: { NumberLottery: true } }, user: true }
        })
        return order
    }

    async getOrderKenoByDisplayId(displayId: number): Promise<Order> {
        const now = new nDate()
        const schedule = await this.prismaService.resultKeno.findFirst({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
        });

        const order = await this.prismaService.order.findFirst({
            where: {
                displayId: +displayId,
                ticketType: LotteryType.Keno,
            },
            include: {
                Lottery: {
                    where: {
                        drawCode: schedule.drawCode,
                        status: OrderStatus.PENDING
                    },
                    include: { NumberLottery: true }
                },
            }
        })

        return order
    }

    async getListOrderByUser(me: User, status: keyof typeof OrderStatus, ticketType: string): Promise<Order[]> {
        const orders = await this.prismaService.order.findMany({
            where: { AND: { userId: me.id, status, ticketType } },
            include: { Lottery: { include: { NumberLottery: true } } }
        })
        return orders
    }

    // Basic order, not for keno
    async getAllOrder(status: (keyof typeof OrderStatus)[], ticketType: string, startTime?: Date, endTime?: Date): Promise<Order[]> {
        const query: { [key: string]: any } = {};

        if (status) {
            query.status = { in: status };
        }
        if (ticketType) {
            query.ticketType = ticketType;
        }
        query.confirmAt = {};

        if (startTime) {
            query.confirmAt.gte = new Date(startTime);
        }
        if (endTime) {
            query.confirmAt.lte = new Date(endTime);
        }

        let orders = await this.prismaService.order.findMany({
            where: query,
            take: 20,
            orderBy: {
                displayId: 'asc',
                // confirmAt: 'asc',
            },
            include: {
                Lottery: { include: { NumberLottery: true } },
                user: true
            }
        })

        // Update lottery expired
        // if (ticketType === 'basic' && status.includes(OrderStatus.PENDING)) {
        //     const now = new nDate();
        //     const max3DSchedule = await this.prismaService.resultMax3d.findFirst({
        //         where: { drawn: false, type: LotteryType.Max3D, drawTime: { gt: now } },
        //         orderBy: { drawCode: 'asc' },
        //     })
        //     const max3DProSchedule = await this.prismaService.resultMax3d.findFirst({
        //         where: { drawn: false, type: LotteryType.Max3DPro, drawTime: { gt: now } },
        //         orderBy: { drawCode: 'asc' },
        //     })
        //     const MegaSchedule = await this.prismaService.resultMega.findFirst({
        //         where: { drawn: false, drawTime: { gt: now } },
        //         orderBy: { drawCode: 'asc' },
        //     })
        //     const powerSchedule = await this.prismaService.resultPower.findFirst({
        //         where: { drawn: false, drawTime: { gt: now } },
        //         orderBy: { drawCode: 'asc' },
        //     })

        //     for (const order of orders) {
        //         for (const lottery of order.Lottery) {
        //             if (lottery.drawTime < now && (lottery.status === OrderStatus.PENDING || lottery.status === OrderStatus.LOCK)) {
        //                 let scheduleType: any = null;

        //                 if (lottery.type === LotteryType.Mega) {
        //                     scheduleType = MegaSchedule;
        //                 }
        //                 else if (lottery.type === LotteryType.Power) {
        //                     scheduleType = powerSchedule;
        //                 }
        //                 else if (lottery.type === LotteryType.Max3D || lottery.type === LotteryType.Max3DPlus) {
        //                     scheduleType = max3DSchedule
        //                 }
        //                 else if (lottery.type === LotteryType.Max3DPro) {
        //                     scheduleType = max3DProSchedule;
        //                 }

        //                 await this.prismaService.lottery.update({
        //                     where: { id: lottery.id },
        //                     data: {
        //                         drawCode: scheduleType.drawCode,
        //                         drawTime: scheduleType.drawTime,
        //                     }
        //                 })
        //             }
        //         }
        //     }
        // }

        return orders;
    }

    async setOrderLotteryToPending(orderId: string) {
        const order = await this.prismaService.order.findUnique({
            where: { id: orderId }
        })

        if (!order) throw new ForbiddenException("Record to update does not exist");

        if (order.status === OrderStatus.LOCK) {
            const lockedOrder = await this.prismaService.order.update({
                data: {
                    status: OrderStatus.PENDING,
                    statusDescription: null,
                    confirmBy: null,
                    confrimUserId: null,
                },
                where: { id: orderId },
                include: { Lottery: true }
            })
            await this.prismaService.$transaction(
                lockedOrder.Lottery.map((child) =>
                    this.prismaService.lottery.update({
                        where: { id: child.id },
                        data: { status: OrderStatus.PENDING },
                    })
                )
            )
        }
    }

    async countKenoPendingOrder(): Promise<number> {
        const now = new nDate()
        const schedule = await this.prismaService.resultKeno.findFirst({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
        });

        const ordersCount = await this.prismaService.lottery.count({
            where: {
                type: LotteryType.Keno,
                drawCode: schedule.drawCode,
                status: OrderStatus.PENDING, // Lock?
            }
        })

        return ordersCount;
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

        if (order.status === OrderStatus.PENDING) { throw new ForbiddenException("Order is not locked") }
        if (order.status === OrderStatus.LOCK) { throw new ForbiddenException("Lottery of order is not printed") }
        if (order.status !== OrderStatus.PRINTED) { throw new ForbiddenException("Order is aleady resolved!") }

        const newStatus = body.status ? body.status : OrderStatus.CONFIRMED
        // const payment = body.payment || LUCKY_KING_PAYMENT
        let confirmBy = ""
        if (user.role == Role.Staff) confirmBy = user.address + " - " + user.personNumber

        // order.Lottery.map(item => {
        //     if (!(item.imageBack || item.imageFront)) { throw new ForbiddenException("All lotteries must have image!") }
        // })

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

        await this.firebaseService.senNotificationToUser(
            order.userId,
            FIREBASE_TITLE.PRINTED_LOTTERY,
            FIREBASE_MESSAGE.PRINTED_LOTTERY
                .replace('ma_don_hang', printCode(order.displayId))
        )

        return orderConfirmed
    }

    async updateKenoOrderStatus(user: User): Promise<Order[]> {
        const printedOrders = await this.prismaService.order.findMany({
            where: {
                status: OrderStatus.PRINTED,
                ticketType: 'keno',
            },
            include: {
                Lottery: true
            }
        })

        const orderIdsToUpdate = [];

        for (const order of printedOrders) {

            let countConfirmedLottery = 0;
            for (const lottery of order.Lottery) {
                if (lottery.status === OrderStatus.CONFIRMED) { countConfirmedLottery++ };
            }
            if (countConfirmedLottery === order.Lottery.length) {
                orderIdsToUpdate.push(order.id);
            }
        }

        const updatedOrders = await this.prismaService.order.updateMany({
            where: {
                id: { in: orderIdsToUpdate }
            },
            data: {
                status: OrderStatus.CONFIRMED,
                confirmAt: new nDate(),
                confirmBy: user.fullName,
                confrimUserId: user.id,
            }
        })

        //@ts-ignore
        return updatedOrders;
    }

    async lockOrder(user: User, { orderIds, description, payment }: lockMultiOrderDTO): Promise<String[]> {
        const lockedOrderIds = [];

        for (const orderId of orderIds) {
            const order = await this.prismaService.order.findUnique({
                where: { id: orderId },
                include: { user: true, Lottery: true }
            })

            if (order.status != OrderStatus.PENDING) { throw new ForbiddenException("Order is aleady resolved!") }

            // const payment = body.payment || LUCKY_KING_PAYMENT
            let confirmBy = ""
            if (user.role == Role.Staff) confirmBy = user.address + " - " + user.personNumber

            const newStatus = OrderStatus.LOCK;

            const lockedOrder = await this.prismaService.order.update({
                data: {
                    status: newStatus,
                    statusDescription: description,
                    // payment: payment,
                    // tradingCode: transaction.id
                },
                where: { id: orderId },
                include: { Lottery: { include: { NumberLottery: true } } }
            })
            await this.prismaService.$transaction(
                lockedOrder.Lottery.map((child) =>
                    this.prismaService.lottery.update({
                        where: { id: child.id },
                        data: { status: newStatus },
                    })
                )
            )

            lockedOrderIds.push(lockedOrder.id)
        }

        return lockedOrderIds
    }

    async getAllOrderByDraw(user: User, drawCode: number, type: LotteryType) {
        const listLottery = await this.prismaService.lottery.findMany({
            where: {
                userId: user.id,
                type: type,
                drawCode: parseInt(drawCode.toString()),
                status: { not: OrderStatus.CART }
            },
            include: { Order: true, NumberLottery: true, }
        })

        let sections = [];

        listLottery.forEach(item => {
            let displayId = item.Order.displayId;
            let section = sections.find(sec => sec.displayId === displayId);
            if (!section) {
                section = {
                    displayId: displayId,
                    id: item.Order.id,
                    items: []
                };
                sections.push(section);
            }
            section.items.push(item);
        });

        return sections
    }
}

