import { ArrayMinSize, IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { LotteryType, OrderMethod } from "src/common/enum";

class CreateOrder {
    @IsEnum(LotteryType)
    @IsNotEmpty()
    lotteryType: string

    // @IsEnum(OrderMethod)
    // @IsNotEmpty()
    method: string

    @IsNotEmpty()
    level: number

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    numbers: any

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @IsNumber({}, { each: true })
    drawCode: number[];

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    drawTime: Date[]

    surcharge: number
    status: string
    cartId: string
}
export class CreateOrderMegaPowerDTO extends CreateOrder { }

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

export class CreateOrderFromCartDTO {
    lotteryIds: string[];

    @IsEnum(OrderMethod)
    method?: keyof typeof OrderMethod;
}