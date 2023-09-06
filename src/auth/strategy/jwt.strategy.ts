import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt"
import { PrismaService } from "../../prisma/prisma.service";
import { errorMessage } from "src/common/error_message";
import { Role } from "src/common/enum";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        public prismaService: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_SECRET'),
        })
    }
    async validate(payload: { sub: string, phoneNumber: string, deviceId?: string }) {
        console.log(payload.phoneNumber)
        const user = await this.prismaService.user.findUnique({
            where: {
                id: payload.sub
            }
        })
        if (!user) throw new UnauthorizedException(errorMessage.USER_NOT_FOUND)
        if (user.role === Role.User) {
            throw new UnauthorizedException("Hệ thống hiện đang bảo trì")
            if (user.currentDeviceId !== payload.deviceId)
                throw new UnauthorizedException(errorMessage.WRONG_DEVICE)
        }
        delete user.hashedPassword
        return user;
    }
}