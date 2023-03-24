import { ArrayMinSize, IsArray, IsNotEmpty } from "class-validator"
import { LotteryType } from "src/common/enum"

export class OldResultMax3dDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    drawTime: any

    @IsNotEmpty()
    type: string

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
    special: any
}

export class ScheduleMax3dDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    drawTime: any

    @IsNotEmpty()
    type: string
}

export class UpdateResultMax3dDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    type: string

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
    special: any
}