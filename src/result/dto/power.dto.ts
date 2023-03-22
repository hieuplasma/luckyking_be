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

}