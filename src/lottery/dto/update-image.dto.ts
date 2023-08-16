import { IsNotEmpty, IsString } from "class-validator";

export class UpdateImageDTO {

    @IsString()
    @IsNotEmpty()
    lotteryId: string

    tryToUpload: number
    
    // @IsString()
    imageFront: string

    // @IsString()
    imageBack: string
}