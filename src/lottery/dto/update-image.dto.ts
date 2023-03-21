import { IsNotEmpty, IsString } from "class-validator";

export class UpdateImageDTO {

    @IsString()
    @IsNotEmpty()
    lotteryId: string
    
    // @IsString()
    imageFront: string

    // @IsString()
    imageBack: string
}