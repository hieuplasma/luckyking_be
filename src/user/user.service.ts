import { Injectable } from "@nestjs/common";
import { User } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { UserDTO } from "./dto/user.dto";

@Injectable({})
export class UserService {
    constructor(private prismaService: PrismaService) { }

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
        return user
    }
}