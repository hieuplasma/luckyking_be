import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator"

export class UserDTO {
    @IsNotEmpty()
    fullName: string
    // @IsEmail()
    // @IsString()
    email: string
    // @IsString()
    address: string
    @IsNotEmpty()
    identify: string

    personNumber: string
}