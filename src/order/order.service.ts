import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Order, OrderStatus, User } from '../../node_modules/.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfirmOrderDTO, CreateOrderKenoDTO, CreateOrderMax3dDTO, CreateOrderMegaPowerDTO, lockMultiOrderDTO, OrderByDrawDTO, ReorderDTO, ReturnOrderDTO } from './dto';
import { LotteryType, OrderMethod, RemoteMessageType, Role, TicketOrderType, TransactionDestination } from 'src/common/enum';
import { INumberDetail, LotteryNumber, NumberDetail } from '../common/entity';
import { caculateSurcharge, formattedDate, getSaleTime, nDate } from 'src/common/utils';
import { UserService } from 'src/user/user.service';
import { DEFAULT_BET, LUCKY_KING_PAYMENT } from 'src/common/constants';
import { TransactionService } from 'src/transaction/transaction.service';
import { LotteryService } from 'src/lottery/lottery.service';
import { FIREBASE_MESSAGE, FIREBASE_TITLE, LIST_STATUS } from 'src/common/constants/constants';
import FirebaseService from '../firebase/firebase-app'
import { KenoSocketService } from 'src/webSocket/kenoWebSocket.service';
import { printCode } from 'src/common/utils/other.utils';
import { errorMessage } from 'src/common/error_message';
import dayjs from 'dayjs';
import { BasicLotterySocketService } from 'src/webSocket/basicLotteryWebSocket.service';

const returnContent = 'Để nâng cấp hệ thống nhằm đem lại trải nghiệm tốt hơn cho Khách hàng, LuckyKing sẽ tiến hành bảo trì hệ thống từ 17h ngày 20/08/2023.'
@Injectable()
export class OrderService {
    constructor(
        private prismaService: PrismaService,
        private userService: UserService,
        private transactionService: TransactionService,
        private lotteryService: LotteryService,
        private kenoSocketService: KenoSocketService,
        private basicLotterySocketService: BasicLotterySocketService,
        private firebaseService: FirebaseService,
    ) { }

    async createOrderPowerMega(user: User, body: CreateOrderMegaPowerDTO): Promise<Order> {

        throw new ForbiddenException(returnContent);
        const balances = await this.userService.getAllWallet(user.id)
        const percent = (await this.prismaService.config.findFirst({}))?.surcharge
        const { drawCode, drawTime, bets, lotteryType } = body;

        // ============= Check drawTime and Sale time ============

        const config = await this.prismaService.config.findFirst();
        const saleTime = getSaleTime(lotteryType as LotteryType, config);
        
        for(const drawTimeItem of drawTime) {
            const stopTime = dayjs(drawTimeItem).subtract(saleTime, "minutes");
            if (dayjs().isAfter(stopTime)) {
                throw new ForbiddenException(errorMessage.TOO_LATE_TO_BUY.replace('TIME', stopTime.format("HH:mm")));
            }
        }
        
        // =============            END               ============

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
                let tuChon = false
                if (lotteryNumbers[i].includes('TC')) tuChon = true
                list.add(new NumberDetail(lotteryNumbers[i], parseInt(bets[i]) || DEFAULT_BET, tuChon));
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
                    surcharge: caculateSurcharge(amount, percent),
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
                    },
                }

                lotteries.push(lottery)
            }
        }

        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(totalAmount, percent)
        if (body.status !== OrderStatus.CART) {
            if (balances.luckykingBalance < totalAmount + surcharge) { throw new ForbiddenException(errorMessage.BALANCE_NOT_ENOUGH) }
        }

        let order: Order;

        await this.prismaService.$transaction(async (tx) => {

            order = await tx.order.create({
                data: {
                    amount: totalAmount,
                    user: {
                        connect: { id: user.id }
                    },
                    //@ts-ignore
                    status: body.status ? body.status : OrderStatus.PENDING,
                    dataPart: formattedDate(currentDate),
                    method: body.method,
                    surcharge: surcharge
                },
                include: {
                    user: true
                }
                // include: { Lottery: { include: { NumberLottery: true } } }
            })

            const transaction = await this.transactionService.payForOrder(
                user,
                totalAmount + surcharge,
                LUCKY_KING_PAYMENT,
                TransactionDestination.LUCKY_KING,
                TransactionDestination.HOST,
                user.id,
                order.id,
                tx,
            )

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

        const dataFirebase = {
            type: RemoteMessageType.DETAIL_ORDER,
            orderId: order.id
        }

        this.firebaseService.sendNotification('Có đơn Power | Mega mới');
        this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.ORDER_SUCCESS,
            FIREBASE_MESSAGE.ORDER_SUCCESS
                .replace('ma_don_hang', printCode(order.displayId))
                .replace('so_tien', totalAmount.toString()),
            dataFirebase
        )

        this.basicLotterySocketService.sendOrderToStaff(order)

        return order
    }

    async createOrderMax3d(user: User, body: CreateOrderMax3dDTO): Promise<Order> {

        throw new ForbiddenException(returnContent);
        const balances = await this.userService.getAllWallet(user.id)
        const percent = (await this.prismaService.config.findFirst({}))?.surcharge || body.surcharge
        const { drawCode, drawTime, lotteryType, level, tienCuoc } = body;

        // ============= Check drawTime and Sale time ============

        const config = await this.prismaService.config.findFirst();
        const saleTime = getSaleTime(lotteryType as LotteryType, config);
        
        for(const drawTimeItem of drawTime) {
            const stopTime = dayjs(drawTimeItem).subtract(saleTime, "minutes");
            if (dayjs().isAfter(stopTime)) {
                throw new ForbiddenException(errorMessage.TOO_LATE_TO_BUY.replace('TIME', stopTime.format("HH:mm")));
            }
        }

        // =============            END               ============

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
                let tuChon = false
                if (setOfNumbers[j][i].includes('TC')) tuChon = true

                // Case Bao => Only one number set
                if (lotteryType === LotteryType.Max3DPro && (level === 10 || level === 4)) {
                    amount = amount + tienCuoc[i];
                    list.add(new NumberDetail(setOfNumbers[j][i], tienCuoc[i], tuChon));
                } else {
                    list.add(new NumberDetail(setOfNumbers[j][i], parseInt(setOfBets[j][i]) || DEFAULT_BET, tuChon));
                    amount += parseInt(setOfBets[j][i]) || DEFAULT_BET;
                }
            }

            for (let i = 0; i < drawCode.length; i++) {
                totalAmount += amount;

                const lottery = {
                    user: {
                        connect: { id: user.id }
                    },
                    type: lotteryType,
                    amount,
                    surcharge: caculateSurcharge(amount, percent),
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

        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(totalAmount, percent)
        if (body.status !== OrderStatus.CART) {
            if (balances.luckykingBalance < totalAmount + surcharge) { throw new ForbiddenException(errorMessage.BALANCE_NOT_ENOUGH) }
        }

        let order: Order;

        await this.prismaService.$transaction(async (tx) => {

            order = await tx.order.create({
                data: {
                    amount: totalAmount,
                    user: {
                        connect: { id: user.id }
                    },
                    //@ts-ignore
                    status: body.status ? body.status : OrderStatus.PENDING,
                    dataPart: formattedDate(currentDate),
                    method: body.method,
                    surcharge: surcharge,
                },
                include: {
                    user: true
                }
                // include: { Lottery: { include: { NumberLottery: true } } }
            })

            const transaction = await this.transactionService.payForOrder(
                user,
                totalAmount + surcharge,
                LUCKY_KING_PAYMENT,
                TransactionDestination.LUCKY_KING,
                TransactionDestination.HOST,
                user.id,
                order.id,
                tx,
            )

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

        const dataFirebase = {
            type: RemoteMessageType.DETAIL_ORDER,
            orderId: order.id
        }

        this.firebaseService.sendNotification('Có đơn max3D mới');
        this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.ORDER_SUCCESS,
            FIREBASE_MESSAGE.ORDER_SUCCESS
                .replace('ma_don_hang', printCode(order.displayId))
                .replace('so_tien', totalAmount.toString()),
            dataFirebase
        )

        this.basicLotterySocketService.sendOrderToStaff(order)

        return order
    }

    async createOrderKeno(user: User, body: CreateOrderKenoDTO): Promise<Order> {
     
        throw new ForbiddenException(returnContent);
        const balances = await this.userService.getAllWallet(user.id)
        const percent = (await this.prismaService.config.findFirst({}))?.kenoSurcharge || 0;
        const { drawCode, drawTime, lotteryType } = body;
        const now = new nDate()
        const schedule = await this.prismaService.resultKeno.findFirst({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
        });

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
                let tuChon = false
                if (setOfNumbers[j][i].includes('TC')) tuChon = true
                list.add(new NumberDetail(setOfNumbers[j][i], parseInt(setOfBets[j][i]) || DEFAULT_BET, tuChon));
                amount += parseInt(setOfBets[j][i]) || DEFAULT_BET;
            }

            for (let i = 0; i < drawCode.length; i++) {
                totalAmount += amount;

                let validDrawCode = drawCode[i];
                let validDrawTime = drawTime[i];

                if (schedule.drawCode > drawCode[i]) {
                    validDrawCode = schedule.drawCode;
                    validDrawTime = schedule.drawTime;
                }

                const lottery = {
                    user: {
                        connect: { id: user.id }
                    },
                    type: lotteryType,
                    amount,
                    surcharge: caculateSurcharge(amount, percent),
                    bets: setOfBets[j],
                    //@ts-ignore
                    status: body.status ? body.status : OrderStatus.PENDING,
                    drawCode: validDrawCode,
                    drawTime: validDrawTime,
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

        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(totalAmount, percent)
        if (body.status !== OrderStatus.CART) {
            if (balances.luckykingBalance < totalAmount + surcharge) { throw new ForbiddenException(errorMessage.BALANCE_NOT_ENOUGH) }
        }

        let order: Order;

        await this.prismaService.$transaction(async (tx) => {

            order = await tx.order.create({
                data: {
                    amount: totalAmount,
                    user: {
                        connect: { id: user.id }
                    },
                    //@ts-ignore
                    status: body.status ? body.status : OrderStatus.PENDING,
                    ticketType: "keno",
                    dataPart: formattedDate(now),
                    method: body.method,
                    surcharge: surcharge,
                },
                include: { Lottery: { include: { NumberLottery: true } } }
            })

            const transaction = await this.transactionService.payForOrder(
                user,
                totalAmount + surcharge,
                LUCKY_KING_PAYMENT,
                TransactionDestination.LUCKY_KING,
                TransactionDestination.HOST,
                user.id,
                order.id,
                tx,
            )

            const lotteryToReturn = []
            for (const lotteryData of lotteries) {
                const lottery = await tx.lottery.create({
                    data: {
                        ...lotteryData,
                        Order: {
                            connect: { id: order.id }
                        }
                    },
                    select: {
                        id: true,
                        type: true,
                        buyTime: true,
                        status: true,
                        orderId: true,
                        userId: true,
                        amount: true,
                        bets: true,
                        displayId: true,
                        drawCode: true,
                        drawTime: true,
                        assignedStaffId: true,
                        NumberLottery: true,
                    },
                })

                lotteryToReturn.push(lottery)
            }

            //@ts-ignore
            order.transaction = transaction;
            //@ts-ignore
            order.Lottery = lotteryToReturn;
        });

        // @ts-ignore
        let lotteriesToSend = order.Lottery.filter((lottery) => lottery.drawCode === schedule.drawCode);
        lotteriesToSend.map((lottery: any) => lottery.Order = { displayId: order.displayId })
        if (lotteriesToSend.length) {
            this.firebaseService.sendNotification('Có đơn keno mới');
            this.kenoSocketService.pushLotteriesToQueue(lotteriesToSend);
        }

        const dataFirebase = {
            type: RemoteMessageType.DETAIL_ORDER,
            orderId: order.id
        }

        this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.ORDER_SUCCESS,
            FIREBASE_MESSAGE.ORDER_SUCCESS
                .replace('ma_don_hang', printCode(order.displayId))
                .replace('so_tien', totalAmount.toString()),
            dataFirebase
        )

        return order;
    }

    async createOrderFromCart(user: User, lotteryIds: string[], method: keyof typeof OrderMethod) {
        
        throw new ForbiddenException(returnContent);
        let totalAmount = 0;
        const lotteryIdsToCreate = []; // Only create lottery with status as cart
        const config = await this.prismaService.config.findFirst({})

        for (const lotteryId of lotteryIds) {
            const lottery = await this.lotteryService.getLotteryById(lotteryId);
            if (!lottery || lottery.status !== OrderStatus.CART) continue;

            // ============= Check drawTime and Sale time ============

            const {type, drawTime} = lottery;
            const saleTime = getSaleTime(type as LotteryType, config);

            const stopTime = dayjs(drawTime).subtract(saleTime, "minutes");
            if (dayjs().isAfter(stopTime)) {
                throw new ForbiddenException(errorMessage.TOO_LATE_TO_BUY_FROM_CART.replace('TYPE', type).replace('TIME', stopTime.format("HH:mm")));
            }
            
            // =============            END               ============

            lotteryIdsToCreate.push(lotteryId);

            const { amount } = lottery;
            totalAmount += amount;
        }

        if (lotteryIdsToCreate.length === 0) throw new ForbiddenException(errorMessage.NO_LOTTERY_CART);

        const percent = config.surcharge;
        const surcharge = caculateSurcharge(totalAmount, percent);
        const totalMoney = totalAmount + surcharge;

        const balances = await this.userService.getAllWallet(user.id);

        if (totalMoney > balances.luckykingBalance) {
            throw new ForbiddenException(errorMessage.BALANCE_NOT_ENOUGH);
        }

        let order: Order;

        await this.prismaService.$transaction(async (tx) => {

            const currentDate = new nDate()
            order = await tx.order.create({
                data: {
                    amount: totalAmount,
                    user: {
                        connect: { id: user.id }
                    },
                    //@ts-ignore
                    status: OrderStatus.PENDING,
                    dataPart: formattedDate(currentDate),
                    method: method || OrderMethod.Keep,
                    surcharge: surcharge,
                    ticketType: 'basic'
                },
                include: {
                    user: true,
                }
            });

            const transaction = await this.transactionService.payForOrder(
                user,
                totalMoney,
                LUCKY_KING_PAYMENT,
                TransactionDestination.LUCKY_KING,
                TransactionDestination.HOST,
                user.id,
                order.id,
                tx,
            )

            const lotteryToReturn = [];
            for (const lotteryId of lotteryIdsToCreate) {
               const lottery = await this.lotteryService.createLotteryFromCart(user, lotteryId, order.id, percent, tx);
               lotteryToReturn.push(lottery);
            }

            //@ts-ignore
            order.transaction = transaction;
            //@ts-ignore
            order.Lottery = lotteryToReturn;
        })

        const dataFirebase = {
            type: RemoteMessageType.DETAIL_ORDER,
            orderId: order.id
        }

        this.firebaseService.sendNotification('Có đơn vé thường mới');
        this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.ORDER_SUCCESS,
            FIREBASE_MESSAGE.ORDER_SUCCESS
                .replace('ma_don_hang', printCode(order.displayId))
                .replace('so_tien', totalAmount.toString()),
            dataFirebase
        )

        this.basicLotterySocketService.sendOrderToStaff(order)

        return order;
    }

    async reorder(user: User, body: ReorderDTO) {

        throw new ForbiddenException(returnContent);
        if (body.lotteries.length === 0) throw new ForbiddenException(errorMessage.NO_LOTTERY_IN_ORDER);

        const amount = parseInt(body.amount.toString())
        const config = await this.prismaService.config.findFirst({})
        let percent = config.surcharge
        if (body.ticketType == TicketOrderType.Keno) percent = config.kenoSurcharge
        const surcharge = caculateSurcharge(amount, percent);
        const totalMoney = amount + surcharge;
        const balances = await this.userService.getAllWallet(user.id);

        if (totalMoney > balances.luckykingBalance) {
            throw new ForbiddenException(errorMessage.BALANCE_NOT_ENOUGH);
        }

        // KENO next result
        const now = new nDate()
        const schedule = await this.prismaService.resultKeno.findFirst({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
        });


        let order: Order;
        await this.prismaService.$transaction(async (tx) => {

            const currentDate = new nDate()
            order = await tx.order.create({
                data: {
                    amount: amount,
                    user: {
                        connect: { id: user.id }
                    },
                    //@ts-ignore
                    status: OrderStatus.PENDING,
                    dataPart: formattedDate(currentDate),
                    method: body.method || OrderMethod.Keep,
                    surcharge: surcharge,
                    ticketType: body.ticketType
                },
                include: {
                    user: true,
                }
            });

            const transaction = await this.transactionService.payForOrder(
                user,
                totalMoney,
                LUCKY_KING_PAYMENT,
                TransactionDestination.LUCKY_KING,
                TransactionDestination.HOST,
                user.id,
                order.id,
                tx,
            )

            let lotteryToReturn = []
            for (const element of body.lotteries) {

                const { type } = element;

                for (const draw of element.drawSelected) {
                    
                    let validDrawCode = draw.drawCode;
                    let validDrawTime = draw.drawTime;

                    // ============= Check drawTime and Sale time ============
                    if (type !== LotteryType.Keno) {
                        const { drawTime } = draw;
                        const saleTime = getSaleTime(type as LotteryType, config);
                        
                        const stopTime = dayjs(drawTime).subtract(saleTime, "minutes");
                        if (dayjs().isAfter(stopTime)) {
                            throw new ForbiddenException(errorMessage.TOO_LATE_TO_RE_ORDER.replace('TYPE', type).replace('TIME', stopTime.format("HH:mm")));
                        }
                    } else {
                        if (schedule.drawCode > draw.drawCode) {
                            validDrawCode = schedule.drawCode;
                            validDrawTime = schedule.drawTime;
                        }
                    }
                    
                    // =============            END               ============

                    let list = element.NumberLottery.numberDetail as INumberDetail[]
                    let listUpdate = new LotteryNumber()
                    for (let i = 0; i < list.length; i++) {
                        list[i].tuChon = false
                        listUpdate.add(list[i])
                    }
                    const lottery = await tx.lottery.create({
                        data: {
                            user: {
                                connect: { id: user.id }
                            },
                            type: element.type,
                            amount: element.amount,
                            surcharge: caculateSurcharge(element.amount, percent),
                            bets: element.bets,
                            //@ts-ignore
                            status: OrderStatus.PENDING,
                            drawCode: validDrawCode,
                            drawTime: validDrawTime,
                            NumberLottery: {
                                create: {
                                    level: parseInt(element.NumberLottery.level.toString()),
                                    numberSets: element.NumberLottery.numberSets,
                                    numberDetail: listUpdate.convertToJSon()
                                }
                            },
                            Order: {
                                connect: { id: order.id }
                            }
                        },
                        select: {
                            id: true,
                            type: true,
                            buyTime: true,
                            status: true,
                            orderId: true,
                            userId: true,
                            amount: true,
                            bets: true,
                            displayId: true,
                            drawCode: true,
                            drawTime: true,
                            assignedStaffId: true,
                            NumberLottery: true,
                            Order: {
                                select: { id: true, displayId: true }
                            }
                        },
                    })

                    lotteryToReturn.push(lottery)
                }
            }

            //@ts-ignore
            order.transaction = transaction;
            //@ts-ignore
            order.Lottery = lotteryToReturn;
        })

        if (body.ticketType == TicketOrderType.Basic) this.firebaseService.sendNotification('Có đơn vé thường mới');
        else {
            // @ts-ignore
            let lotteriesToSend = order.Lottery.filter((lottery) => lottery.drawCode === schedule.drawCode);
            lotteriesToSend.map((lottery: any) => lottery.Order = { displayId: order.displayId })
            if (lotteriesToSend.length) {
                this.firebaseService.sendNotification('Có đơn keno mới');
                this.kenoSocketService.pushLotteriesToQueue(lotteriesToSend);

            }
        }

        const dataFirebase = {
            type: RemoteMessageType.DETAIL_ORDER,
            orderId: order.id
        }

        this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.ORDER_SUCCESS,
            FIREBASE_MESSAGE.ORDER_SUCCESS
                .replace('ma_don_hang', printCode(order.displayId))
                .replace('so_tien', amount.toString()),
            dataFirebase
        )

        this.basicLotterySocketService.sendOrderToStaff(order)

        return order
    }

    async getOrderById(orderId: string): Promise<Order> {
        const order = await this.prismaService.order.findUnique({
            where: { id: orderId },
            include: {
                Lottery: {
                    orderBy: {
                        displayId: 'asc',
                    },
                    include: { NumberLottery: true }
                },
                user: true,
                transaction: true
            },
        })
        return order
    }

    async getOrderByDisplayId(displayId: number): Promise<Order> {
        const config = await this.prismaService.config.findFirst({});

        if (config.stopDistributingBasicTickets) {
            return null;
        }

        const order = await this.prismaService.order.findFirst({
            where: { displayId: displayId },
            include: {
                Lottery: {
                    orderBy: {
                        displayId: 'desc',
                    },
                    include: { NumberLottery: true }
                },
                user: true,
                transaction: true
            },
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
                transaction: true
            }
        })

        return order
    }

    async getListOrderByUser(me: User, status: keyof typeof OrderStatus, ticketType: string): Promise<Order[]> {
        const orders = await this.prismaService.order.findMany({
            where: { AND: { userId: me.id, status, ticketType } },
            include: { Lottery: { include: { NumberLottery: true } }, transaction: true },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return orders
    }

    async getListOrderByUser2(me: User, status: any, ticketType: string): Promise<Order[]> {
        let listStatus: OrderStatus[] = []
        if (status == 'booked') listStatus = LIST_STATUS.BOOKED
        if (status == 'pending') listStatus = LIST_STATUS.PENDING
        if (status == 'complete') listStatus = LIST_STATUS.PRINTED
        if (status == 'returned') listStatus = LIST_STATUS.ERROR
        const orders = await this.prismaService.order.findMany({
            where: { AND: { userId: me.id, status: { in: listStatus }, ticketType } },
            include: { Lottery: { include: { NumberLottery: true } }, transaction: true },
            orderBy: {
                createdAt: 'desc'
            }
        })
        let group = groupBySortedArr(orders, 'dataPart')
        return group
    }

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
            // take: 20,
            orderBy: {
                displayId: 'asc',
                // confirmAt: 'asc',
            },
            include: {
                Lottery: { include: { NumberLottery: true } },
                user: true,
                transaction: true
            }
        })
        return orders;
    }

    // Will update later
    async getPendingOrderByDisplayId(displayId: number): Promise<Order> {
        const now = new nDate();

        const order = await this.prismaService.order.findFirst({
            where: { displayId: displayId },
            include: {
                Lottery: {
                    where: {
                        assignedStaffId: null,
                        status: { in: [OrderStatus.PENDING, OrderStatus.LOCK, OrderStatus.PRINTED] },
                        drawTime: { gt: now },
                    },
                    orderBy: {
                        displayId: 'desc',
                    },
                    include: { NumberLottery: true }
                },
                user: true,
                transaction: true
            },
        })

        return order
    }

    async getListSoldOrders(user: User, ticketType: string, startTime?: Date, endTime?: Date): Promise<Order[]> {
        const lotteries = await this.prismaService.lottery.findMany({
            where: {
                assignedStaffId: user.id,
                confirmedAt: {
                    lte: endTime ? new Date(endTime) : undefined,
                    gte: startTime ? new Date(startTime) : undefined,
                },
                status: { in: [OrderStatus.CONFIRMED, OrderStatus.WON, OrderStatus.PAID, OrderStatus.NO_PRIZE] },
            },
        });


        const lotteryIds = lotteries.map(lottery => lottery.id);
        let orderIds = lotteries.map(lottery => lottery.orderId);
        const setOrderIds = new Set(orderIds);
        orderIds = Array.from(setOrderIds)

        const orders = await this.prismaService.order.findMany({
            where: {
                id: { in: orderIds },
                ticketType: ticketType
            },
            orderBy: {
                displayId: 'desc'
            },
            include: {
                Lottery: {
                    where: {
                        id: { in: lotteryIds }
                    },
                    // orderBy: {
                    //     displayId: 'asc'
                    // },
                },
                user: true
            }
        });

        return orders;
    }

    async getOrderDetailByStaff(user: User, orderId: string): Promise<Order> {
        const now = new nDate();

        const staff = await this.prismaService.user.findUnique({
            where: { id: user.id },
            include: {
                LotteryAssigned: {
                    where: {
                        status: { in: [OrderStatus.PENDING, OrderStatus.LOCK, OrderStatus.PRINTED] },
                        drawTime: { gt: now },
                    }
                },
            }
        })

        const lotteryIds = staff.LotteryAssigned.map(lottery => lottery.id);

        const order = await this.prismaService.order.findUnique({
            where: { id: orderId },
            include: {
                Lottery: {
                    where: { id: { in: lotteryIds } },
                    orderBy: {
                        displayId: 'asc',
                    },
                    include: { NumberLottery: true }
                },
                user: true
            },
        })

        return order
    }


    async getBasicOrdersAvailable(user: User): Promise<Order[]> {
        const config = await this.prismaService.config.findFirst({});
        const { stopDistributingBasicTickets, maxNumberOfLockedOrder } = config;

        if (stopDistributingBasicTickets) {
            return [];
        }

        const now = new nDate();
        // const numberOfLotteries = 5;

        const staff = await this.prismaService.user.findUnique({
            where: {
                id: user.id,
            },
            include: {
                LotteryAssigned: {
                    where: {
                        drawTime: { gt: now },
                        status: { in: [OrderStatus.PENDING, OrderStatus.LOCK, OrderStatus.PRINTED] }
                    },
                },
            }
        });

        const lotteries = await this.prismaService.lottery.findMany({
            where: {
                assignedStaffId: null,
                type: { not: LotteryType.Keno },
                drawTime: { gt: now },
                status: { in: [OrderStatus.PENDING, OrderStatus.LOCK, OrderStatus.PRINTED] },
            },
            // take: numberOfLotteries
        });

        const lotteryIds = lotteries.map(lottery => lottery.id).concat(staff.LotteryAssigned.map(lottery => lottery.id));
        let orderIds = lotteries.map(lottery => lottery.orderId).concat(staff.LotteryAssigned.map(lottery => lottery.orderId));
        const setOrderIds = new Set(orderIds);
        orderIds = Array.from(setOrderIds)

        const orders = await this.prismaService.order.findMany({
            where: {
                id: { in: orderIds }
            },
            include: {
                Lottery: {
                    where: {
                        id: { in: lotteryIds }
                    },
                    orderBy: {
                        displayId: 'asc'
                    },
                    include: { NumberLottery: true }
                },
                user: true
            },
            orderBy: {
                displayId: 'asc'
            },
            take: maxNumberOfLockedOrder
        });

        for (const order of orders) {
            for (const lottery of order.Lottery) {
                if (!lottery.assignedStaffId) {
                    await this.prismaService.lottery.update({
                        where: { id: lottery.id },
                        data: { assignedStaffId: user.id }
                    })
                }
            }
        }

        return orders;
    }

    async setOrderLotteryToPending(orderId: string) {
        const order = await this.prismaService.order.findUnique({
            where: { id: orderId }
        })

        if (!order) throw new NotFoundException(errorMessage.NO_ORDER);

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

    async countKenoPendingOrder(): Promise<any> {
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

        return { count: ordersCount };
    }

    async returnOrder(user: User, body: ReturnOrderDTO): Promise<Order> {
        const order = await this.prismaService.order.findUnique({
            where: { id: body.orderId }
        })
        if (order.status != OrderStatus.PENDING) { throw new ForbiddenException(errorMessage.RESOLVED_ORDER) }

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

        if (order.status === OrderStatus.PENDING) { throw new ForbiddenException(errorMessage.NOT_LOCK_ORDER) }
        if (order.status === OrderStatus.LOCK) { throw new ForbiddenException(errorMessage.NOT_PRINT_ORDER) }
        if (order.status !== OrderStatus.PRINTED) { throw new ForbiddenException(errorMessage.RESOLVED_ORDER) }

        const newStatus = body.status ? body.status : OrderStatus.CONFIRMED
        // const payment = body.payment || LUCKY_KING_PAYMENT
        let confirmBy = ""
        if (user.role == Role.Staff) confirmBy = user.address + " - " + user.personNumber

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

        await this.prismaService.$transaction(async (tx) => {
            for (const lottery of orderConfirmed.Lottery) {
                if (lottery.status !== OrderStatus.RETURNED) {
                    await tx.lottery.update({
                        where: {
                            id: lottery.id,
                        },
                        data: {
                            confirmedAt: new nDate(),
                            status: newStatus
                        }
                    })
                }
            }
        })

        return orderConfirmed
    }

    async confirmOrderByStaff(user: User, orderId: string): Promise<any> {
        const now = new nDate();

        const staff = await this.prismaService.user.findUnique({
            where: {
                id: user.id
            },
            include: {
                LotteryAssigned: {
                    where: {
                        orderId: orderId,
                        status: OrderStatus.PRINTED
                    }
                }
            }
        });

        await this.prismaService.$transaction(async (tx) => {
            for (const lottery of staff.LotteryAssigned) {
                await tx.lottery.update({
                    where: {
                        id: lottery.id,
                    },
                    data: {
                        confirmedAt: now,
                        status: OrderStatus.CONFIRMED
                    }
                })
            }

            await tx.order.update({
                where: {
                    id: orderId,
                },
                data: {
                    confirmAt: now,
                }
            })
        })

        return {
            message: 'ok'
        }
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

            if (order.status !== OrderStatus.PENDING) { throw new ForbiddenException(errorMessage.RESOLVED_ORDER) }

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
            await this.prismaService.$transaction(async (tx) => {
                for (const lottery of lockedOrder.Lottery) {
                    if (lottery.status !== OrderStatus.RETURNED) {
                        await tx.lottery.update({
                            where: {
                                id: lottery.id,
                            },
                            data: {
                                status: newStatus
                            }
                        })
                    }
                }
            })

            lockedOrderIds.push(lockedOrder.id)
        }

        return lockedOrderIds
    }

    async lockOrderByStaff(user: User, { orderIds, description, payment }: lockMultiOrderDTO): Promise<String[]> {
        const staff = await this.prismaService.user.findUnique({
            where: {
                id: user.id,
            },
            include: {
                LotteryAssigned: {
                    where: {
                        orderId: { in: orderIds },
                        status: OrderStatus.PENDING,
                    }
                }
            }
        })

        await this.prismaService.$transaction(async (tx) => {
            for (const lottery of staff.LotteryAssigned) {
                await tx.lottery.update({
                    where: {
                        id: lottery.id,
                    },
                    data: {
                        status: OrderStatus.LOCK,
                    }
                })

            }

            await tx.order.updateMany({
                where: {
                    id: { in: orderIds }
                },
                data: {
                    status: OrderStatus.LOCK,
                }
            })
        })

        return orderIds;
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

const groupBySortedArr = (sortedArray: any[], properties: string) => {
    const res: any[] = []
    let currentValue = undefined
    let currentIndex = -1;
    for (const element of sortedArray) {
        if (element[properties] == currentValue) {
            res[currentIndex].data.push(element)
        }
        else {
            currentIndex++;
            currentValue = element[properties]
            res[currentIndex] = {
                key: currentValue,
                data: [element]
            }
        }
    }
    return res
};
