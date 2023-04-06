import { IsNotEmpty, IsString } from "class-validator";

// export class DeleteOrderCartDTO {

//     @IsString()
//     @IsNotEmpty()
//     orderId: string
// }

export class DeleteLotteryCartDTO {

    @IsString()
    @IsNotEmpty()
    lotteryId: string
}

export class DeleteNumberLotteryDTO {
    @IsString()
    @IsNotEmpty()
    numberId: string

    @IsNotEmpty()
    position: number
}