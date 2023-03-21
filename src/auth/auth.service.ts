import { ForbiddenException, Injectable } from "@nestjs/common";
import { PrismaService } from "..//prisma/prisma.service";
import * as argon from 'argon2';
import { AuthDTO, CheckAuthDTO, CreateStaffDTO, UpdatePassWordDTO } from "./dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { Role, UserStatus } from "src/common/enum";

@Injectable({})
export class AuthService {

    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
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
                    status: UserStatus.Acticve,
                    Device: {
                        create: {
                            deviceId: authDTO.deviceId,
                            lastLogin: new Date()
                        }
                    },
                    role: Role.User,
                    MoneyAccount: { create: { decription: "Ví LuckyKing của " + authDTO.phoneNumber } },
                    RewardWallet: { create: { decription: "Ví nhận thưởng của " + authDTO.phoneNumber } },
                    Cart: { create: {} }
                },
                select: {
                    id: true,
                    phoneNumber: true,
                    createdAt: true,
                    Device: true,
                    MoneyAccount: true,
                    RewardWallet: true
                }
            })
            const accessToken = await this.signJwtToken(user.id, user.phoneNumber)
            //@ts-ignore
            user.accessToken = accessToken.accessToken
            return user
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
        const deviceId = await this.prismaService.device.findFirst({
            where: {
                AND: { userId: user.id, deviceId: authDTO.deviceId }
            }
        })
        if (!deviceId) await this.prismaService.device.create({
            data: {
                deviceId: authDTO.deviceId,
                lastLogin: new Date(),
                user: {
                    connect: { id: user.id }
                }
            }
        })
        return await this.signJwtToken(user.id, user.phoneNumber)
    }

    async createStaff(createStaffDTO: CreateStaffDTO) {
        const hashedPassword = await argon.hash(createStaffDTO.password)
        try {
            const user = await this.prismaService.user.create({
                data: {
                    phoneNumber: createStaffDTO.phoneNumber,
                    hashedPassword: hashedPassword,
                    status: UserStatus.Acticve,
                    Device: {
                        create: {
                            deviceId: createStaffDTO.deviceId,
                            lastLogin: new Date()
                        }
                    },
                    fullName: createStaffDTO.fullName,
                    role: createStaffDTO.role,
                    address: createStaffDTO.address,
                    personNumber: createStaffDTO.personNumber,
                    identify: createStaffDTO.identify
                },
                select: {
                    id: true,
                    phoneNumber: true,
                    createdAt: true,
                    Device: true,
                    fullName: true,
                    role: true,
                    address: true,
                    personNumber: true,
                    identify: true
                }
            })
            const accessToken = await this.signJwtToken(user.id, user.phoneNumber)
            //@ts-ignore
            user.accessToken = accessToken.accessToken
            return user
        } catch (error) {
            if (error.code == 'P2002') {
                // throw new ForbiddenException(error.message)
                throw new ForbiddenException("registered phone number")
            }
        }
    }

    async updatePassword(body: UpdatePassWordDTO) {
        const hashedPassword = await argon.hash(body.newPassword)
        const user = await this.prismaService.user.findUnique({
            where: {
                phoneNumber: body.phoneNumber
            }
        })
        if (!user) { throw new ForbiddenException("User not found") }
        const passwordMatched = await argon.verify(
            user.hashedPassword,
            body.oldPassword
        )
        if (!passwordMatched) return { errorMessage: "Wrong password", errorCode: "LG001" }

        const update = await this.prismaService.user.update({
            where: { phoneNumber: body.phoneNumber },
            data: { hashedPassword: hashedPassword },
            select: { phoneNumber: true, updateAt: true }
        })
        return update
    }

    async signJwtToken(userId: string, phoneNumber: string)
        : Promise<{ accessToken: string }> {
        const payload = {
            sub: userId,
            phoneNumber
        }
        const jwtString = await this.jwtService.signAsync(payload, {
            expiresIn: '2 days',
            secret: this.configService.get('JWT_SECRET')
        })
        return {
            accessToken: jwtString
        }
    }
}