import { IsNotEmpty, IsPhoneNumber, IsString, IS_PHONE_NUMBER } from "class-validator"

export class AuthDTO {
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phoneNumber: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsString()
    deviceId: string
}

export class CheckAuthDTO{
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phoneNumber: string

    @IsNotEmpty()
    @IsString()
    deviceId: string
}

export class UpdatePassWordDTO {
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phoneNumber: string

    @IsNotEmpty()
    @IsString()
    oldPassword: string

    @IsNotEmpty()
    @IsString()
    newPassword: string
}