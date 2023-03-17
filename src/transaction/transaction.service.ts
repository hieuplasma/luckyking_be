import { ForbiddenException, Injectable } from '@nestjs/common';
import { User } from '../../node_modules/.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType } from '../common/enum'
import { RechargeDTO, WithDrawLuckyKingDTO } from './dto';
import { WalletEnum } from './enum';

@Injectable()
export class TransactionService {
    constructor(private prismaService: PrismaService) { }

    async rechargeMoney(transactionPerson: User, body: RechargeDTO) {
        if ((body.amount % 1000) != 0) { throw new ForbiddenException("The amount must be a multiple of 1000") }
        const user = await this.prismaService.user.findUnique({
            where: { phoneNumber: body.phoneNumber }
        })
        if (!user) { throw new ForbiddenException("User not found") }
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
                destination: body.destination,
                transactionPersonId: transactionPerson.id
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
        const moneyAccount = await this.updateLucKyingBalance(user.id, body.amount, WalletEnum.Increase)
        delete transaction.User.hashedPassword
        //@ts-ignore
        transaction.currentBalance = moneyAccount.balance
        return transaction
    }

    async withdrawToLuckyKing(user: User, body: WithDrawLuckyKingDTO) {
        if ((body.amount % 1000) != 0) { throw new ForbiddenException("The amount must be a multiple of 1000") }
        const wallet = await this.prismaService.rewardWallet.findUnique({
            where: { userId: user.id }
        })
        if (wallet.balance < body.amount) { throw new ForbiddenException("The balance is not enough") }
        const transaction = await this.prismaService.transaction.create({
            data: {
                type: TransactionType.WithDraw,
                description: "Đổi thưởng về ví LuckyKing",
                amount: parseInt(body.amount.toString()),
                payment: "Chuyển tiền nội bộ LuckyKing",
                User: {
                    connect: { id: user.id }
                },
                source: "Ví nhận thưởng",
                destination: "Ví LuckyKing",
                transactionPersonId: user.id
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

        const moneyAccount = await this.updateLucKyingBalance(user.id, body.amount, WalletEnum.Increase)
        const rewardWallet = await this.updateRewardWalletBalance(user.id, body.amount, WalletEnum.Decrease)
        delete transaction.User.hashedPassword
        //@ts-ignore
        transaction.luckykingBalance = moneyAccount.balance
        //@ts-ignore
        transaction.rewardWalletBalance = rewardWallet.balance
        return transaction
    }

    private async updateLucKyingBalance(userId, amount, type) {
        // Update so du trong tai khoan vi luckyking
        const moneyAccount = await this.prismaService.moneyAccount.update({
            data: {
                balance: { increment: (type == WalletEnum.Increase ? 1 : -1) * parseInt(amount.toString()) }
            },
            where: { userId: userId },
            select: {
                balance: true
            }
        })
        return moneyAccount
    }

    private async updateRewardWalletBalance(userId, amount, type) {
        // Update so du trong tai khoan vi nhan thuong
        const rewardWallet = await this.prismaService.rewardWallet.update({
            data: {
                balance: { increment: (type == WalletEnum.Increase ? 1 : -1) * parseInt(amount.toString()) }
            },
            where: { userId: userId },
            select: {
                balance: true
            }
        })
        return rewardWallet
    }
}
