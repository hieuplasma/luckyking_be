import { ArrayMinSize, IsArray, IsNotEmpty } from "class-validator"
import { LotteryType } from "src/common/enum"

export class OldResultMax3dDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    drawTime: any

    @IsNotEmpty()
    type: keyof typeof LotteryType

    @IsArray()
    @ArrayMinSize(1)
    first: any

    @IsArray()
    @ArrayMinSize(1)
    second: any

    @IsArray()
    @ArrayMinSize(1)
    third: any

    @IsArray()
    @ArrayMinSize(1)
    consolation: any
}