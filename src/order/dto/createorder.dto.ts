import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { LotteryType, OrderMethod } from "src/common/enum";

export class CreateOrderDTO {
    @IsEnum(LotteryType)
    @IsNotEmpty()
    lotteryType: string

    @IsNotEmpty()
    amount: number

    @IsEnum(OrderMethod)
    @IsNotEmpty()
    method: string

    @IsNotEmpty()
    level: number

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    numbers: any

    @IsNotEmpty()
    @IsString()
    periodCode: string

    surcharge: number
}