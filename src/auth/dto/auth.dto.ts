import { IsNotEmpty, IsPhoneNumber, IsString } from "class-validator"
import { errorMessage } from "src/common/error_message"

export class AuthDTO {
    // @IsPhoneNumber('VN', { message: errorMessage.INVALID_PHONENUMBER })
    @IsNotEmpty()
    phoneNumber: string

    @IsNotEmpty({ message: errorMessage.EMPTY_PASS })
    @IsString()
    password: string

    deviceId: string
}

export class CheckAuthDTO {
    // @IsPhoneNumber('VN', { message: errorMessage.INVALID_PHONENUMBER })
    @IsNotEmpty()
    phoneNumber: string

    // @IsNotEmpty()
    // @IsString()
    deviceId: string
}

export class UpdatePassWordDTO {
    // @IsPhoneNumber('VN', { message: errorMessage.INVALID_PHONENUMBER })
    @IsNotEmpty({ message: errorMessage.INVALID_PHONENUMBER })
    phoneNumber: string

    @IsNotEmpty({ message: errorMessage.EMPTY_PASS })
    @IsString()
    oldPassword: string

    @IsNotEmpty()
    @IsString()
    newPassword: string
}

export class ForgotPassWordDTO {
    // @IsPhoneNumber('VN', { message: errorMessage.INVALID_PHONENUMBER })
    @IsNotEmpty()
    phoneNumber: string

    @IsNotEmpty({ message: errorMessage.EMPTY_PASS })
    @IsString()
    newPassword: string
}