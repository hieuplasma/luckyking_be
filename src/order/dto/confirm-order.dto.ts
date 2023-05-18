import { LotteryType } from 'src/common/enum';
import { OrderStatus } from '../../../node_modules/.prisma/client'
import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator"

type OrderType = keyof typeof OrderStatus;

export class ReturnOrderDTO {
    @IsEnum(OrderStatus)
    status: OrderType

    @IsNotEmpty()
    orderId: string

    description: string
}

export class ConfirmOrderDTO {
    @IsEnum(OrderStatus)
    @IsOptional()
    status?: OrderStatus

    @IsNotEmpty()
    orderId: string

    payment: string

    description: string
}
export class lockMultiOrderDTO {
    @IsNotEmpty()
    @IsString({ each: true })
    orderIds: string[]

    payment: string

    description: string
}

export class OrderByDrawDTO {
    @IsNotEmpty()
    type: LotteryType

    @IsNotEmpty()
    drawCode: number
}