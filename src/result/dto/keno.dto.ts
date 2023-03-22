import { IsNotEmpty } from "class-validator"

export class OldResultKenoDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    drawTime: any

    @IsNotEmpty()
    result: string
}