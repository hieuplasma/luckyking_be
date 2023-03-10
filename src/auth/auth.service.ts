import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "..//prisma/prisma.service";
import * as argon from 'argon2';
import { AuthDTO } from "./dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {

    constructor(
        private prismaService: PrismaService,
        private jwrService: JwtService,
        private configService: ConfigService
    ) { }

    async register(authDTO: AuthDTO) {
        const hashedPassword = await argon.hash(authDTO.password)
        try {
            const user = await this.prismaService.user.create({
                data: {
                    phoneNumber: authDTO.phoneNumber,
                    hashedPassword: hashedPassword,
                    fullName: '',
                    email: '',
                    address: '',
                    identify: '',
                    balance: 0
                },
                select: {
                    id: true,
                    phoneNumber: true,
                    createdAt: true
                }
            })
            return await this.signJwtToken(user.id, user.phoneNumber)
        } catch (error) {
            if (error.code == 'P2002') {
                // throw new ForbiddenException(error.message)
                throw new ForbiddenException("registered phone number")
            }
        }
    }

    async login(authDTO: AuthDTO) {
        const user = await this.prismaService.user.findUnique({
            where: {
                phoneNumber: authDTO.phoneNumber
            }
        })
        if (!user) { throw new ForbiddenException("User not found") }
        const passwordMatched = await argon.verify(
            user.hashedPassword,
            authDTO.password
        )
        if (!passwordMatched)
            return { message: "Wrong password" }
        delete user.hashedPassword
        return await this.signJwtToken(user.id, user.phoneNumber)
    }

    async signJwtToken(userId: number, phoneNumber: string)
        : Promise<{ accessToken: string }> {
        const payload = {
            sub: userId,
            phoneNumber
        }
        const jwtString = await this.jwrService.signAsync(payload, {
            expiresIn: '2 days',
            secret: this.configService.get('JWT_SECRET')
        })
        return {
            accessToken: jwtString
        }
    }
}