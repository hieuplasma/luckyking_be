import { IsNotEmpty } from "class-validator";

export class OldResultPowerDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    drawTime: any

    @IsNotEmpty()
    result: string

    @IsNotEmpty()
    specialNumber: number

    jackpot1: number
    jackpot2: number
}

export class UpdateResultPowerDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    result: string

    @IsNotEmpty()
    specialNumber: number
}