import { Injectable } from '@nestjs/common';
import { Lottery, OrderStatus, User, NumberLottery } from '@prisma/client';
import { DEFAULT_BET } from 'src/common/constants';
import { LotteryNumber, NumberDetail } from 'src/common/entity';
import { ICreateLottery } from 'src/lottery/interfaces';
import { LotteryService } from 'src/lottery/lottery.service';
import { NumberLotteryService } from 'src/numberLottery/numberLottery.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from 'src/user/user.service';
import { CreateCartKenoDTO, CreateCartMegaPowerDTO, DeleteNumberLotteryDTO } from './dto';

@Injectable()
export class CartService {
    constructor(
        private prismaService: PrismaService,
        private userService: UserService,
        private lotteryService: LotteryService,
        private numberLotteryService: NumberLotteryService
    ) { }

    async addLotteryPowerMega(user: User, body: CreateCartMegaPowerDTO) {
        const status = OrderStatus.CART
        const cartId = await this.getCardId(user.id);
        const { drawCode, drawTime, lotteryType, bets } = body;
        const numbers = [...body.numbers];
        const setOfNumbers = [];
        let i = 0;

        while (numbers.length) {
            setOfNumbers[i] = setOfNumbers[i] ? setOfNumbers[i] : [];
            setOfNumbers[i].push(numbers.shift())
            if (setOfNumbers[i].length === 6) i++;
        }

        const lotteries = [];

        await this.prismaService.$transaction(async (tx) => {
            for (const lotteryNumbers of setOfNumbers) {
                let amount = 0;
                let list = new LotteryNumber();

                lotteryNumbers.map((item: any, index: number) => {
                    list.add(new NumberDetail(item, bets ? parseInt(bets[index]) : DEFAULT_BET));
                    amount += bets ? parseInt(bets[index]) : DEFAULT_BET;
                })


                for (let i = 0; i < drawCode.length; i++) {
                    const createLotteryData: ICreateLottery = {
                        userId: user.id,
                        type: lotteryType,
                        amount,
                        bets,
                        status,
                        drawCode: drawCode[i],
                        drawTime: drawTime[i],
                        NumberLottery: {
                            level: parseInt(body.level.toString()),
                            numberSets: lotteryNumbers.length,
                            numberDetail: list.convertToJSon()
                        },
                        cartId,
                    }

                    const lottery = await this.lotteryService.createLottery(createLotteryData, tx);
                    lotteries.push(lottery)
                }
            }
        })

        return lotteries
    }

    async getLotteryFromCart(user: User): Promise<Lottery[]> {
        const cartId = await this.getCardId(user.id)
        const list = await this.lotteryService.getLotteriesByCartId(cartId);

        return list;
    }

    async deleteLottery(user: User, lotteryId: string) {
        const deletedLottery = await this.lotteryService.deleteLottery(lotteryId);

        return deletedLottery;
    }

    async deleteNumber(user: User, body: DeleteNumberLotteryDTO): Promise<NumberLottery | {
        errorMessage: string;
        errorCode: string;
    }> {
        const { numberId, position } = body;
        return await this.numberLotteryService.deleteNumberDetail(numberId, position);
    }

    async deleteAllLottery(user: User) {
        const cartId = await this.getCardId(user.id)
        return await this.lotteryService.deleteLotteryByCartId(cartId)
    }

    async addLotteryKeno(user: User, body: CreateCartKenoDTO) {
        const status = OrderStatus.CART
        const cartId = await this.getCardId(user.id)
        const { drawCode, drawTime, lotteryType } = body;
        const numbers = [...body.numbers];
        const setOfNumbers = [];
        let i = 0;

        while (numbers.length) {
            setOfNumbers[i] = setOfNumbers[i] ? setOfNumbers[i] : [];
            setOfNumbers[i].push(numbers.shift())
            if (setOfNumbers[i].length === 6) i++;
        }

        const lotteries = [];

        await this.prismaService.$transaction(async (tx) => {
            for (const lotteryNumbers of setOfNumbers) {
                let amount = 0;
                let list = new LotteryNumber();

                lotteryNumbers.map((item: any, index: number) => {
                    list.add(new NumberDetail(item, body.bets ? parseInt(body.bets[index]) : DEFAULT_BET));
                    amount += body.bets ? parseInt(body.bets[index]) : DEFAULT_BET;
                })

                for (let i = 0; i < drawCode.length; i++) {
                    const createLotteryData: ICreateLottery = {
                        userId: user.id,
                        type: lotteryType,
                        amount,
                        bets: body.bets,
                        status,
                        drawCode: drawCode[i],
                        drawTime: drawTime[i],
                        NumberLottery: {
                            level: parseInt(body.level.toString()),
                            numberSets: lotteryNumbers.length,
                            numberDetail: list.convertToJSon()
                        },
                        cartId,
                    }

                    const lottery = await this.lotteryService.createLottery(createLotteryData, tx);
                    lotteries.push(lottery)
                }
            }
        })

        return lotteries
    }

    async addLotteryMax3D(user: User, body: CreateCartKenoDTO) {
        const status = OrderStatus.CART
        const cartId = await this.getCardId(user.id)
        const { drawCode, drawTime, lotteryType } = body;
        const numbers = [...body.numbers];
        const setOfNumbers = [];
        let i = 0;

        while (numbers.length) {
            setOfNumbers[i] = setOfNumbers[i] ? setOfNumbers[i] : [];
            setOfNumbers[i].push(numbers.shift())
            if (setOfNumbers[i].length === 6) i++;
        }

        const lotteries = [];

        await this.prismaService.$transaction(async (tx) => {
            for (const lotteryNumbers of setOfNumbers) {
                let amount = 0;
                let list = new LotteryNumber();

                lotteryNumbers.map((item: any, index: number) => {
                    list.add(new NumberDetail(item, body.bets ? parseInt(body.bets[index]) : DEFAULT_BET));
                    amount += body.bets ? parseInt(body.bets[index]) : DEFAULT_BET;
                })

                for (let i = 0; i < drawCode.length; i++) {
                    const createLotteryData: ICreateLottery = {
                        userId: user.id,
                        type: lotteryType,
                        amount,
                        bets: body.bets,
                        status,
                        drawCode: drawCode[i],
                        drawTime: drawTime[i],
                        NumberLottery: {
                            level: parseInt(body.level.toString()),
                            numberSets: lotteryNumbers.length,
                            numberDetail: list.convertToJSon()
                        },
                        cartId,
                    }

                    const lottery = await this.lotteryService.createLottery(createLotteryData, tx);
                    lotteries.push(lottery);
                }
            }
        })

        return lotteries
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
