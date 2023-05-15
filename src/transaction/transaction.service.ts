import { ForbiddenException, Injectable } from '@nestjs/common';
import { Transaction, User } from '../../node_modules/.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionType } from '../common/enum'
import { RechargeDTO, WithDrawLuckyKingDTO } from './dto';
import { WalletEnum } from './enum';

@Injectable()
export class TransactionService {
    constructor(private prismaService: PrismaService) { }

    // Transaction nap tien vao vi luckyking
    async rechargeMoney(transactionPerson: User, body: RechargeDTO) {
        if ((body.amount % 1000) != 0) { throw new ForbiddenException("Số tiền phải chia hết cho 1000") }
        const user = await this.prismaService.user.findUnique({
            where: { phoneNumber: body.phoneNumber }
        })
        if (!user) { throw new ForbiddenException("User không tồn tại") }
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
        //@ts-ignore
        transaction.message = "success"
        return transaction
    }

    // Transaction rut tien ve vi luckyking
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

    // Transaction mua ve, khong co controller
    async payForOrder(user, amount, payment, source, destination, transactionPersonId, session?) {
        const prismaService = session ? session : this.prismaService;

        const wallet = await this.prismaService.moneyAccount.findUnique({
            where: { userId: user.id }
        })

        if (wallet.balance < amount) { throw new ForbiddenException("The balance is not enough") }
        const transaction = await prismaService.transaction.create({
            data: {
                type: TransactionType.BuyLottery,
                description: "Mua vé xổ số",
                amount: parseInt(amount.toString()),
                payment: payment,
                User: {
                    connect: { id: user.id }
                },
                source: source,
                destination: destination,
                transactionPersonId: transactionPersonId
            },
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                payment: true,
                User: true,
                source: true,
                destination: true,
            }
        })
        const moneyAccount = await this.updateLucKyingBalance(user.id, amount, WalletEnum.Decrease, session)
        //@ts-ignore
        transaction.luckykingBalance = moneyAccount.balance
        return transaction
    }

    async getListTransaction(user: User) {
        const list: Transaction[] = await this.prismaService.transaction.findMany({
            where: { userId: user.id }
        })
        return list
    }

    async getListTransactionByUserId(userId: string) {
        const list: Transaction[] = await this.prismaService.transaction.findMany({
            where: { userId: userId }
        })
        return list
    }

    // Transaction tra thuong, khong co controller
    async rewardLottery(userid: string, amount: number, transactionPersonId: string, lotteryType: string) {
        const transaction = await this.prismaService.transaction.create({
            data: {
                type: TransactionType.Rewarded,
                description: "Trả thưởng vé " + lotteryType,
                amount: parseInt(amount.toString()),
                payment: "Chuyền tiền vào ví nhận thưởng",
                User: {
                    connect: { id: userid }
                },
                source: "Trung tâm LuckyKing",
                destination: "Ví nhận thưởng",
                transactionPersonId: transactionPersonId
            },
            select: {
                id: true,
                type: true,
                description: true,
                amount: true,
                payment: true,
                User: true,
                source: true,
                destination: true,
            }
        })
        const reward = await this.updateRewardWalletBalance(userid, amount, WalletEnum.Increase)
        //@ts-ignore
        transaction.luckykingBalance = reward.balance
        return transaction
    }

    // Private function 
    private async updateLucKyingBalance(userId, amount, type, session?) {
        const prismaService = session ? session : this.prismaService;
        // Update so du trong tai khoan vi luckyking
        const moneyAccount = await prismaService.moneyAccount.update({
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
    // ------ End -------
}
