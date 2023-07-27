import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ConfirmOtpDTO, CreateOtpDTO } from './dto/otp.dto';

@Controller('otp')
export class OtpController {

    constructor(private otpService: OtpService) { }

    @Post('create-otp')
    createOtp(@Body() body: CreateOtpDTO) {
        return this.otpService.createOtp(body)
    }

    @Post('confirm-otp')
    confirmOtp(@Body() body: ConfirmOtpDTO) {
        return this.otpService.confirmOtp(body)
    }
}
