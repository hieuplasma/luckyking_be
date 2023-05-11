import { IsNotEmpty, IsString } from "class-validator";

export class PrintDTO {
    @IsString()
    @IsNotEmpty()
    lotteryId: string
}