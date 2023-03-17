import { IsNotEmpty } from "class-validator";

export class WithDrawLuckyKingDTO {
    @IsNotEmpty()
    amount: number
}