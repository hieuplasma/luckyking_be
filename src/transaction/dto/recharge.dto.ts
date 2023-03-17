import { IsNotEmpty, IsPhoneNumber } from "class-validator"

export class RechargeDTO {
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phoneNumber: string

    @IsNotEmpty()
    amount: number

    payment: string
    source: string
    destination: string
}