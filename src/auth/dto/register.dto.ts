import { IsNotEmpty, IsPhoneNumber, IsString, IsEmail, IsOptional } from "class-validator"
import { errorMessage } from "src/common/error_message"


export class RegisterDTO {
  @IsPhoneNumber('VN', { message: errorMessage.INVALID_PHONENUMBER })
  @IsNotEmpty()
  phoneNumber: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsString()
  @IsOptional()
  fullName: string

  @IsString()
  @IsOptional()
  identify: string

  @IsEmail()
  @IsOptional()
  email: string

  @IsString()
  @IsNotEmpty()
  deviceId: string
}
