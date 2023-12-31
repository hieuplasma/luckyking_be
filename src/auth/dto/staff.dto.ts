import { IsEnum, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator"
import { Role } from "src/common/enum"
import { errorMessage } from "src/common/error_message"

export class CreateStaffDTO {
    @IsPhoneNumber('VN', { message: errorMessage.INVALID_PHONENUMBER })
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
    @IsEnum(Role)
    role: string

    @IsNotEmpty()
    @IsString()
    personNumber: string
}