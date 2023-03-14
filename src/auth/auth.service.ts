import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "..//prisma/prisma.service";
import * as argon from 'argon2';
import { AuthDTO, CheckAuthDTO } from "./dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable({})
export class AuthService {

    constructor(
        private prismaService: PrismaService,
        private jwrService: JwtService,
        private configService: ConfigService
    ) { }

    async check(checkAuthDTO: CheckAuthDTO) {
        const user = await this.prismaService.user.findUnique({
            where: {
                phoneNumber: checkAuthDTO.phoneNumber
            }
        })
        if (!user) return { errorMessage: "Request register", errorCode: "CA001" }
        // if (user.status == 'block') return { errorMessage: "This account had been block", errorCode: "CA002" }
        const device = this.prismaService.device.findFirst({
            where: {
                AND: { userId: user.id, deviceId: checkAuthDTO.deviceId }
            }
        })
        if (!device) return { errorMessage: "Request OTP", errorCode: "CA003" }
        return { errorMessage: "Allow login", errorCode: "CA004" }
    }

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
                    balance: 0,
                    device: {
                        create: {
                            deviceId: authDTO.deviceId,
                            lastLogin: new Date()
                        }
                    }
                },
                select: {
                    id: true,
                    phoneNumber: true,
                    createdAt: true,
                    device: true
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
            return { errorMessage: "Wrong password", errorCode: "LG001" }
        delete user.hashedPassword
        const device = await this.prismaService.device.create({
            data: {
                deviceId: authDTO.deviceId,
                lastLogin: new Date(),
                User: {
                    connect: { id: user.id }
                }
            }
        })
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