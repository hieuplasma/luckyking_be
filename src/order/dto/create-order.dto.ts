import { Lottery, NumberLottery } from "@prisma/client";
import { ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { LotteryType, OrderMethod, TicketOrderType } from "src/common/enum";

class CreateOrder {
    @IsEnum(LotteryType)
    @IsNotEmpty()
    lotteryType: string

    // @IsEnum(OrderMethod)
    // @IsNotEmpty()
    method: string

    amount: number

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
export class CreateOrderMegaPowerDTO extends CreateOrder {
    @IsArray()
    @ArrayMinSize(1)
    bets: any
}

export class CreateOrderMax3dDTO extends CreateOrder {
    @IsArray()
    @ArrayMinSize(1)
    bets: any

    // @IsArray()
    // @ArrayMinSize(1)
    tienCuoc: any
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

interface DrawSelected {
    drawCode: number
    drawTime: any
}
interface LotteryReorder extends Lottery {
    drawSelected: DrawSelected[],
    NumberLottery: NumberLottery
}

export class ReorderDTO {

    amount: number
    surcharge: number

    @IsEnum(OrderMethod)
    method?: keyof typeof OrderMethod;

    lotteries: LotteryReorder[]
    ticketType: TicketOrderType
}