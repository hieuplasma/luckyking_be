import { IsEmail, IsNotEmpty, IsPhoneNumber, IsString } from "class-validator"

export class UserDTO {
    @IsString()
    fullName: string
    @IsEmail()
    @IsString()
    email: string
    @IsString()
    address: string
    @IsString()
    identify: string
}