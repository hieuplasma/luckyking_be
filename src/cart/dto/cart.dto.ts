import { IsNotEmpty, IsString } from "class-validator";

export class DeleteOrderCartDTO {

    @IsString()
    @IsNotEmpty()
    orderId: string
}