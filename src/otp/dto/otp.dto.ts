import { IsNotEmpty } from "class-validator"

export class CreateOtpDTO {
    @IsNotEmpty()
    phoneNumber: string
}

export class ConfirmOtpDTO {
    @IsNotEmpty()
    key: string

    @IsNotEmpty()
    otp: string
}