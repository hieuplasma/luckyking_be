import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsString } from "class-validator";
import { LotteryType, OrderMethod } from "src/common/enum";

class CreateOrder {
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
    drawCode: number

    surcharge: number
    status: string
    cartId: string
}
export class CreateOrderMegaPowerDTO extends CreateOrder{}

export class CreateOrderMax3dDTO extends CreateOrder {
    @IsArray()
    @ArrayMinSize(1)
    bets: any
}

export class CreateOrderKenoDTO extends CreateOrder {
    @IsArray()
    @ArrayMinSize(1)
    bets: any
}