import { IsNotEmpty } from "class-validator"
import { OTPSender } from "src/common/enum"

export class CreateOtpDTO {
    @IsNotEmpty()
    phoneNumber: string

    otpSender: OTPSender
}

export class ConfirmOtpDTO {
    @IsNotEmpty()
    key: string

    @IsNotEmpty()
    otp: string
}