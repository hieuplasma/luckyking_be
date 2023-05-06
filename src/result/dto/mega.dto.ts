import { IsNotEmpty } from "class-validator"

export class OldResultMegaDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    drawTime: any

    @IsNotEmpty()
    result: string

    jackpot: number
}