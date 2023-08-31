import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Transaction, User, WithdrawRequest, Lottery, BalanceFluctuations } from '../../node_modules/.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { LotteryType, RemoteMessageType, TransactionDestination, TransactionStatus, TransactionType } from '../common/enum'
import { AcceptBankWithdrawDTO, RechargeDTO, WithDrawBankAccountDTO, WithDrawLuckyKingDTO } from './dto';
import { WalletEnum } from './enum';
import { nDate } from 'src/common/utils';
import FirebaseService from '../firebase/firebase-app'
import { FIREBASE_MESSAGE, FIREBASE_TITLE } from 'src/common/constants/constants';
import { errorMessage } from 'src/common/error_message';
import { printCode } from 'src/common/utils/other.utils';

@Injectable()
export class TransactionService {
    constructor(
        private prismaService: PrismaService,
        private firebaseService: FirebaseService
    ) { }

    // Transaction nap tien vao vi luckyking
    async rechargeMoney(transactionPerson: User, body: RechargeDTO) {
        const amount = parseInt(body.amount.toString())
        // if ((amount % 1000) != 0) { throw new ForbiddenException(errorMessage.MONEY_DEVIDE_1000) }
        const user = await this.prismaService.user.findUnique({
            where: { phoneNumber: body.phoneNumber }
        })
        if (!user) { throw new NotFoundException(errorMessage.USER_NOT_FOUND) }
        const transaction = await this.prismaService.transaction.create({
            data: {
                type: TransactionType.Recharge,
                description: "Nạp tiền vào ví LuckyKing",
                amount: amount,
                payment: body.payment,
                User: {
                    connect: { id: user.id }
                },
                source: body.source,
                destination: TransactionDestination.LUCKY_KING,
                transactionPersonId: transactionPerson.id
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
        const moneyAccount = await this.updateLucKyingBalance(user.id, body.amount, WalletEnum.Increase, transaction.id)

        const dataFirebase = {
            type: RemoteMessageType.LUCKYKING_WALLET,
        }

        this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.RECHARGE_SUCCESS,
            FIREBASE_MESSAGE.RECHARGE_SUCCESS.replace('so_tien', amount + '').replace('nguon_tien', body.payment),
            dataFirebase
        )

        delete transaction.User.hashedPassword
        //@ts-ignore
        transaction.currentBalance = moneyAccount.balance
        //@ts-ignore
        transaction.message = "success"
        return transaction
    }

    // Transaction rut tien ve vi luckyking
    async withdrawToLuckyKing(user: User, body: WithDrawLuckyKingDTO) {
        const amount = parseInt(body.amount.toString())
        if ((amount % 1000) != 0) { throw new ForbiddenException(errorMessage.MONEY_DEVIDE_1000) }
        const wallet = await this.prismaService.rewardWallet.findUnique({
            where: { userId: user.id }
        })
        if (wallet.balance < amount) { throw new ForbiddenException(errorMessage.BALANCE_NOT_ENOUGH) }
        const transaction = await this.prismaService.transaction.create({
            data: {
                type: TransactionType.WithDraw,
                description: "Đổi thưởng về ví LuckyKing",
                amount: amount,
                payment: "Chuyển tiền nội bộ LuckyKing",
                User: {
                    connect: { id: user.id }
                },
                source: TransactionDestination.REWARD,
                destination: TransactionDestination.LUCKY_KING,
                transactionPersonId: user.id
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
        const moneyAccount = await this.updateLucKyingBalance(user.id, body.amount, WalletEnum.Increase, transaction.id)
        const rewardWallet = await this.updateRewardWalletBalance(user.id, body.amount, WalletEnum.Decrease, transaction.id)

        delete transaction.User.hashedPassword
        //@ts-ignore
        transaction.luckykingBalance = moneyAccount.balance
        //@ts-ignore
        transaction.rewardWalletBalance = rewardWallet.balance

        const dataFirebase = {
            type: RemoteMessageType.LUCKYKING_WALLET,
        }

        this.firebaseService.senNotificationToUser(
            user.id,
            FIREBASE_TITLE.WITHDRAW_LUCKYKING,
            FIREBASE_MESSAGE.WITHDRAW_LUCKYKING.replace('so_tien', amount + ''),
            dataFirebase
        )

        return transaction
    }

    async requestWithDrawToBank(user: User, body: WithDrawBankAccountDTO) {
        const MIN_WITHDRAW = (await this.prismaService.config.findFirst({})).minAmountCanWithdrawn
        const amount = parseInt(body.amount.toString())
        if (amount < MIN_WITHDRAW) { throw new ForbiddenException(`Số tiền phải lớn hơn ${MIN_WITHDRAW}đ!`) }

        if (body.save) {
            await this.prismaService.bankAccount.upsert({
                where: {
                    uniqueAccount: {
                        shortName: body.shortName,
                        accountNumber: body.accountNumber,
                        userId: user.id
                    }
                },
                create: {
                    userId: user.id,
                    name: body.name,
                    userName: body.userName,
                    logo: body.logo,
                    code: body.code,
                    shortName: body.shortName,
                    accountNumber: body.accountNumber,
                    amount: amount
                },
                update: {
                    name: body.name,
                    userName: body.userName,
                    code: body.code,
                    logo: body.logo,
                    shortName: body.shortName,
                    accountNumber: body.accountNumber,
                    amount: amount
                }
            })
        }

        const withdrawRequest = await this.prismaService.withdrawRequest.create({
            data: {
                amount: amount,
                userId: user.id,
                name: body.name,
                userName: body.userName,
                code: body.code,
                shortName: body.shortName,
                status: TransactionStatus.PENDING,
                accountNumber: body.accountNumber
            }
        })

        const transaction = await this.prismaService.transaction.create({
            data: {
                type: TransactionType.WithDraw,
                description: "Yêu cầu đổi thưởng về TKNH",
                amount: withdrawRequest.amount,
                payment: "Chuyển khoản ngân hàng",
                User: {
                    connect: { id: withdrawRequest.userId }
                },
                source: TransactionDestination.REWARD,
                destination: withdrawRequest.shortName + " - " + withdrawRequest.accountNumber + " - " + withdrawRequest.userName,
                WithdrawRequest: {
                    connect: {
                        id: withdrawRequest.id
                    }
                }
            }
        })
        await this.updateRewardWalletBalance(withdrawRequest.userId, Number(withdrawRequest.amount), WalletEnum.Decrease, transaction.id)
        const dataFirebase = {
            type: RemoteMessageType.REWARD_WALLET,
        }
        this.firebaseService.senNotificationToUser(
            withdrawRequest.userId,
            FIREBASE_TITLE.WITHDRAW_BANK_ACOUNT,
            FIREBASE_MESSAGE.WITHDRAW_BANK_ACOUNT
                .replace('so_tien', withdrawRequest.amount.toString())
                .replace('ma_rut', printCode(withdrawRequest.displayId)),
            dataFirebase
        )
        return withdrawRequest
    }

    // Transaction mua ve, khong co controller
    async payForOrder(user, amount, payment, source, destination, transactionPersonId, orderId, session?) {

        const prismaService = session ? session : this.prismaService

        const wallet = await this.prismaService.moneyAccount.findUnique({
            where: { userId: user.id }
        })

        if (wallet.balance < amount) { throw new ForbiddenException(errorMessage.BALANCE_NOT_ENOUGH) }
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
                transactionPersonId: transactionPersonId,
                Order: {
                    connect: { id: orderId }
                }
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
        const moneyAccount = await this.updateLucKyingBalance(user.id, amount, WalletEnum.Decrease, transaction.id, session);

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
    async rewardLottery(userid: string, amount: number, transactionPersonId: string, lottery: Lottery) {

        const transaction = await this.prismaService.transaction.create({
            data: {
                type: TransactionType.Rewarded,
                description: "Trả thưởng vé " + lottery.type,
                amount: parseInt(amount.toString()),
                payment: "Chuyền tiền vào ví nhận thưởng",
                User: {
                    connect: { id: userid }
                },
                source: TransactionDestination.HOST,
                destination: TransactionDestination.REWARD,
                transactionPersonId: transactionPersonId,
                Lottery: {
                    connect: { id: lottery.id }
                }
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
        const walletAfter = await this.updateRewardWalletBalance(userid, amount, WalletEnum.Increase, transaction.id)

        // @ts-ignore
        transaction.luckykingBalance = walletAfter.balance
        return transaction
    }

    async getHistoryMoneyAccount(userId: string, skip: number, take: number): Promise<BalanceFluctuations[]> {
        const wallet = await this.prismaService.moneyAccount.findUnique({
            where: { userId: userId }
        })

        const list = await this.prismaService.balanceFluctuations.findMany({
            where: { moneyAccountId: wallet.id },
            orderBy: {
                transaction: { createdAt: 'desc' }
            },
            skip: skip ? parseInt(skip.toString()) : 0,
            take: take ? parseInt(take.toString()) : 20,
            include: { transaction: true }
        })

        return list
    }


    async getHistoryRewardWallet(userId: string, skip: number, take: number): Promise<BalanceFluctuations[]> {
        const wallet = await this.prismaService.rewardWallet.findUnique({
            where: { userId: userId }
        })

        const list = await this.prismaService.balanceFluctuations.findMany({
            where: { rewardWalletId: wallet.id },
            orderBy: {
                transaction: { createdAt: 'desc' }
            },
            skip: skip ? parseInt(skip.toString()) : 0,
            take: take ? parseInt(take.toString()) : 20,
            include: { transaction: true }
        })

        return list
    }

    // Private function 
    private async updateLucKyingBalance(userId: string, amount: number, type: WalletEnum, transactionId: string, session?) {
        const prismaService = session ? session : this.prismaService;
        // Update so du trong tai khoan vi luckyking
        const moneyAccount = await prismaService.moneyAccount.update({
            data: {
                balance: { increment: (type == WalletEnum.Increase ? 1 : -1) * parseInt(amount.toString()) }
            },
            where: { userId: userId },
            select: {
                balance: true, id: true
            }
        })

        await prismaService.balanceFluctuations.create({
            data: {
                transactionId: transactionId,
                moneyAccountId: moneyAccount.id,
                balanceBefore: Number(moneyAccount.balance) + (type == WalletEnum.Increase ? -1 : 1) * parseInt(amount.toString()),
                balanceAfter: moneyAccount.balance,
            }
        })

        return moneyAccount
    }

    private async updateRewardWalletBalance(userId: string, amount: number, type: WalletEnum, transactionId: string) {
        // Update so du trong tai khoan vi nhan thuong
        const rewardWallet = await this.prismaService.rewardWallet.update({
            data: {
                balance: { increment: (type == WalletEnum.Increase ? 1 : -1) * parseInt(amount.toString()) }
            },
            where: { userId: userId },
            select: {
                balance: true, id: true
            }
        })

        await this.prismaService.balanceFluctuations.create({
            data: {
                transactionId: transactionId,
                rewardWalletId: rewardWallet.id,
                balanceBefore: Number(rewardWallet.balance) + (type == WalletEnum.Increase ? -1 : 1) * parseInt(amount.toString()),
                balanceAfter: rewardWallet.balance,
            },
        })
        return rewardWallet
    }
    // ------ End -------
}
