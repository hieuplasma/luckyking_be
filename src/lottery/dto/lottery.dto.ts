import { IsNotEmpty, IsString } from "class-validator";

export class CreateLotteryDTO {

    @IsString()
    @IsNotEmpty()
    lotteryId: string
    
    // @IsString()
    imageFront: string

    // @IsString()
    imageBack: string
}