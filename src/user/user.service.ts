import { Injectable } from "@nestjs/common";
import { Role } from "src/common/enum";
import { nDate } from "src/common/utils";
import { User, BankAccount } from '../../node_modules/.prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { UserDTO } from "./dto/user.dto";

@Injectable()
export class UserService {
    constructor(private prismaService: PrismaService) { }

    async getUserInfo(me: User) {
        const user = await this.prismaService.user.findUnique({
            where: { id: me.id },
            include: {
                BankAccount: true
            }
        })
        if (user.role == Role.User) {
            const balance = await this.getBalance(me.id)
            //@ts-ignore
            user.luckykingBalance = balance.luckykingBalance
            //@ts-ignore
            user.rewardWalletBalance = balance.rewardWalletBalance
        }
        delete user.hashedPassword
        return user
    }

    async updateUserInfo(me: User, body: UserDTO) {
        const user = await this.prismaService.user.update({
            data: {
                fullName: body.fullName,
                identify: body.identify,
                address: body.address,
                email: body.email,
                personNumber: body.personNumber,
                updateAt: new nDate()
            },
            where: {
                phoneNumber: me.phoneNumber
            }
        })
        delete user.hashedPassword
        return user
    }

    async getAllUser() {
        const users = await this.prismaService.user.findMany()
        users.map((item) => delete item.hashedPassword)
        return users
    }

    async getAllWallet(userId: string) {
        return await this.getBalance(userId)
    }

    private async getBalance(userId: string) {
        const moneyAccount = await this.prismaService.moneyAccount.findUnique({
            where: { userId: userId }
        })
        const rewardWallet = await this.prismaService.rewardWallet.findUnique({
            where: { userId: userId }
        })
        return {
            luckykingBalance: moneyAccount.balance,
            rewardWalletBalance: rewardWallet.balance
        }
    }
}