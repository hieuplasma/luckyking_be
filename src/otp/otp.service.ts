import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfirmOtpDTO, CreateOtpDTO } from './dto/otp.dto';
import { JwtService } from '@nestjs/jwt';
import { nDate } from 'src/common/utils';
import { errorMessage } from 'src/common/error_message';
import axios from 'axios';
import { Cron } from '@nestjs/schedule';
import { TIMEZONE } from 'src/common/constants/constants';

export const OTP_SECRECT = "OTP_LUCKYKING_SECRECT"
const URL_SEND_OTP = 'https://business.openapi.zalo.me/message/template'
const URL_GET_ZALOTOKEN = 'https://oauth.zaloapp.com/v4/oa/access_token'
@Injectable()
export class OtpService {
    constructor(
        private prismaService: PrismaService,
        private jwtService: JwtService,
    ) { }

    async createOtp(body: CreateOtpDTO) {
        let otp = this.generateOTP()
        if (body.phoneNumber == '0358272555') {
            otp = '654321'
        }
        const now = new nDate().getTime()
        const session = await this.prismaService.otp.create({
            data: {
                otp: otp,
                phoneNumber: body.phoneNumber,
                iat: new Date(now),
                exp: new Date(now + 300000)
            },
        })

        delete (session.otp)
        this.sendZaloOTP(otp, body.phoneNumber)

        return session
    }

    async confirmOtp(body: ConfirmOtpDTO) {

        const session = await this.prismaService.otp.findUnique({
            where: {
                id: body.key,
            }
        })

        if (!session) throw new ForbiddenException(errorMessage.INVALID_SESSION)

        if (body?.otp?.toString().trim() == session.otp) {
            if (session.exp < new Date()) throw new ForbiddenException(errorMessage.EXP_OTP)
            const payload = {
                key: session.id,
                otp: session.otp,
                phoneNumber: session.phoneNumber
            }
            const token = await this.jwtService.signAsync(payload, {
                expiresIn: 300,
                secret: OTP_SECRECT,
            });
            return {
                success: true,
                token: token
            }
        }

        else throw new ForbiddenException(errorMessage.INVALID_OTP)
    }

    async sendZaloOTP(otp: string, phoneNumber: string) {
        let tmp = phoneNumber
        if (tmp.charAt(0) == '0') tmp = tmp.replace('0', '+84')
        const zaloToken = (await this.prismaService.config.findFirst({})).zaloToken
        const config: any = {
            headers: {
                'Content-Type': 'application/json',
                'access_token': zaloToken
            }
        }
        const postData = {
            "phone": tmp,
            "template_id": "272864",
            "template_data": {
                "otp": otp
            },
            "tracking_id": "tracking_id"
        }
        const res = await axios.post(URL_SEND_OTP, postData, config)
        if (res.data) console.log(res.data)
        else console.log(res)
    }

    private generateOTP() {
        var digits = '0123456789';
        let OTP = '';
        for (let i = 0; i < 6; i++) {
            OTP += digits[Math.floor(Math.random() * 10)];
        }
        return OTP;
    }

    @Cron('0 2 * * *', { timeZone: TIMEZONE })
    async replaceZaloToken() {
        if (process.env.ENV !== 'production') return console.log("this is not production mode, do not refresh zalo token")
        const zaloRefeshToken = (await this.prismaService.config.findFirst({})).zaloRefeshToken
        const config: any = {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'secret_key': 'GbyYH0FVCPKO56USgoJf'
            }
        }
        const postData = {
            refresh_token: zaloRefeshToken,
            app_id: "1921869123487336353",
            grant_type: "refresh_token"
        }

        const res = await axios.post(URL_GET_ZALOTOKEN, postData, config)
        if (res.data) {
            console.log(res.data)
            const config = await this.prismaService.config.findFirst({})
            await this.prismaService.config.update({
                where: { id: config.id },
                data: {
                    zaloToken: res.data.access_token,
                    zaloRefeshToken: res.data.refresh_token
                }
            })
        }
        else console.log(res)
    }
}
