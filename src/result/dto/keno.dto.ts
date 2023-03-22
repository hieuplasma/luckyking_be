import { IsNotEmpty } from "class-validator"

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