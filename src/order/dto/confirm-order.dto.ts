import { OrderStatus } from '../../../node_modules/.prisma/client'
import { IsEnum, IsNotEmpty } from "class-validator"

export class ReturnOrderDTO {
    @IsEnum(OrderStatus)
    status: OrderStatus

    @IsNotEmpty()
    orderId: string

    description: string
}