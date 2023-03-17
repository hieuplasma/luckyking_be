import { Injectable } from "@nestjs/common";
import { User } from '../../node_modules/.prisma/client';
import { PrismaService } from "../prisma/prisma.service";
import { UserDTO } from "./dto/user.dto";

@Injectable({})
export class UserService {
    constructor(private prismaService: PrismaService) { }

    async getUserInfo(me: User) {
        const user = await this.prismaService.user.findUnique({
            where: { id: me.id }
        })
        const balance = await this.getBalance(me.id)
        //@ts-ignore
        user.luckykingBalance = balance.luckykingBalance
        //@ts-ignore
        user.rewardWalletBalance = balance.rewardWalletBalance
        delete user.hashedPassword
        return user
    }

    async updateUserInfo(me: User, body: UserDTO) {
        const user = await this.prismaService.user.update({
            data: {
                fullName: body.fullName,
                identify: body.identify,
                address: body.address,
                email: body.email
            },
            where: {
                phoneNumber: me.phoneNumber
            }
        })
        user.updateAt = new Date()
        delete user.hashedPassword
        return user
    }

    async getAllUser() {
        const users = await this.prismaService.user.findMany()
        users.map((item) => delete item.hashedPassword)
        return users
    }

    private async getBalance(userId) {
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