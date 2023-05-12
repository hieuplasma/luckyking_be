import { IsNotEmpty } from "class-validator"
import { LotteryType } from "src/common/enum"

export class OldResultKenoDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    drawTime: any

    @IsNotEmpty()
    result: string
}

export class ScheduleKenoDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    drawTime: any
}

export class UpdateResultKenoDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    result: string
}

export class GetResultByDrawCodeDTO {
    @IsNotEmpty()
    drawCode: number

    @IsNotEmpty()
    type: LotteryType
}