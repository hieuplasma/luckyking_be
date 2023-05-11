import { IsArray, IsNotEmpty, IsNumber, IsString } from "class-validator";

class NumberLottery {
    @IsArray()
    @IsString({ each: true })
    numbers: string[]
}

export class UpdateLotteryNumbersDTO {
    @IsNotEmpty()
    NumberLottery: NumberLottery
}