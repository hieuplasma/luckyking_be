import { ForbiddenException, Injectable } from '@nestjs/common';
import { Order, User } from '../../node_modules/.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDTO } from './dto';
import { LotteryStatus, OrderStatus, RewardStatus } from 'src/common/enum';
import { LotteryNumber, NumberDetail } from 'src/entity';
import { caculateSurcharge } from 'src/common/utils';
import { UserService } from 'src/user/user.service';

@Injectable()
export class OrderService {
    constructor(private prismaService: PrismaService, private userService: UserService) { }

    async createOrderPowerMega(user: User, body: CreateOrderDTO): Promise<Order> {
        const balances = await this.userService.getAllWallet(user.id)
        const amount = parseInt(body.amount.toString())
        const surcharge = body.surcharge ? parseInt(body.surcharge.toString()) : caculateSurcharge(amount)
        if ((amount % 1000) != 0) { throw new ForbiddenException("The amount must be a multiple of 1000") }
        if (balances.luckykingBalance < amount + surcharge) { throw new ForbiddenException("The balance is not enough") }
        let currentDate = new Date()
        let list = new LotteryNumber()
        body.numbers.map(item => {
            list.add(new NumberDetail(item, 0))
        })
        const order = await this.prismaService.order.create({
            data: {
                amount: amount,
                user: {
                    connect: { id: user.id }
                },
                status: OrderStatus.PENDING,
                dataPart: "" + currentDate.getDate() + (currentDate.getMonth() + 1) + currentDate.getFullYear(),
                method: body.method,
                rewardStatus: RewardStatus.PENDING,
                surcharge: surcharge,
                Lottery: {
                    create: {
                        userId: user.id,
                        type: body.lotteryType,
                        bets: amount,
                        status: LotteryStatus.PENDING,
                        periodCode: body.periodCode,
                        periodTime: new Date(Date.now() + (3600 * 1000 * 24)),
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
}
