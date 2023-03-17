import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator"

export class CreateStaffDTO {
    @IsPhoneNumber('VN')
    @IsNotEmpty()
    phoneNumber: string

    @IsNotEmpty()
    @IsString()
    password: string

    @IsNotEmpty()
    @IsString()
    deviceId: string

    @IsNotEmpty()
    @IsString()
    fullName: string

    @IsNotEmpty()
    @IsString()
    address: string

    @IsNotEmpty()
    @IsString()
    identify: string

    @IsNotEmpty()
    @IsString()
    role: string

    @IsNotEmpty()
    @IsString()
    personNumber: string
}