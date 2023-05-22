import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy, ExtractJwt } from "passport-jwt"
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        configService: ConfigService,
        public prismaService: PrismaService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_SECRET')
        })
    }
    async validate(payload: { sub: string, phoneNumber: string }) {
        console.log(payload.phoneNumber)
        const user = await this.prismaService.user.findUnique({
            where: {
                id: payload.sub
            }
        })
        if (!user) throw new UnauthorizedException('User not found')
        delete user.hashedPassword
        return user;
    }
}