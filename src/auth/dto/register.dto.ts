import { IsNotEmpty, IsPhoneNumber, IsString, IsEmail } from "class-validator"
import { errorMessage } from "src/common/error_message"


export class RegisterDTO {
  @IsPhoneNumber('VN', { message: errorMessage.INVALID_PHONENUMBER })
  @IsNotEmpty()
  phoneNumber: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsString()
  fullName: string

  @IsString()
  identify: string

  @IsEmail()
  email: string

  @IsString()
  @IsNotEmpty()
  deviceId: string
}
