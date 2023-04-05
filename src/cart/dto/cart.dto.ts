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