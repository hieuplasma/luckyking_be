import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType } from '../common/enum'
import { RechargeDTO } from './dto';

@Injectable()
export class TransactionService {
    constructor(private prismaService: PrismaService) { }

    async rechargeMoney(body: RechargeDTO) {
        if ((body.amount % 1000) != 0) { throw new ForbiddenException("The amount must be a multiple of 1000") }
        const user = await this.prismaService.user.findUnique({
            where: { phoneNumber: body.phoneNumber }
        })
        const transaction = await this.prismaService.transaction.create({
            data: {
                type: TransactionType.Recharge,
                description: "Nạp tiền vào ví LuckyKing",
                amount: parseInt(body.amount.toString()),
                payment: body.payment,
                User: {
                    connect: { id: user.id }
                },
                source: body.source,
                destination: body.destination
            },
            select: {
                type: true,
                description: true,
                amount: true,
                payment: true,
                User: true,
                source: true,
                destination: true,
            }
        })
        const moneyAccount = await this.prismaService.moneyAccount.update({
            data: {
                balance: { increment: parseInt(body.amount.toString()) }
            },
            where: { userId: user.id },
            select: {
                balance: true
            }
        })
        delete transaction.User.hashedPassword
        //@ts-ignore
        transaction.currentBalance = moneyAccount.balance
        return transaction
    }
}
