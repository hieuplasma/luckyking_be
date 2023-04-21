import { OrderStatus } from '../../../node_modules/.prisma/client'
import { IsEnum, IsNotEmpty, IsOptional } from "class-validator"

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