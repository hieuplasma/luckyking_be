import { IsNotEmpty, IsString } from "class-validator";

export class UpdateDeviceTokenTO {
    @IsString()
    @IsNotEmpty()
    deviceId: string

    @IsString()
    @IsNotEmpty()
    deviceToken: string
}