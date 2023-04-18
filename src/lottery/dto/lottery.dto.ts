import { IsNotEmpty, IsString } from "class-validator";

export class LotteryDTO {

    @IsString()
    @IsNotEmpty()
    lotteryId: string
    
    // @IsString()
    imageFront: string

    // @IsString()
    imageBack: string
}