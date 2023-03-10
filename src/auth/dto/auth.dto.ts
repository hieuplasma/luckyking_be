import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator"

export class AuthDTO {
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phoneNumber: string

    @IsNotEmpty()
    @IsString()
    password: string
}