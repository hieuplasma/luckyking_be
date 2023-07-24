import { ArrayMinSize, IsArray, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { LotteryType } from "src/common/enum";

export class CreateCart {
    @IsEnum(LotteryType)
    @IsNotEmpty()
    lotteryType: string

    amount: number

    level: number

    @IsArray()
    @IsString({ each: true })
    @ArrayMinSize(1)
    numbers: any

    @IsArray()
    @IsNotEmpty()
    @ArrayMinSize(1)
    @IsNumber({}, { each: true })
    drawCode: number[];

    drawTime: Date[]

    @IsString()
    @IsOptional()
    cartId: string
}

export class CreateCartMegaPowerDTO extends CreateCart {
    @IsArray()
    @ArrayMinSize(1)
    @IsOptional()
    bets: any
}

export class CreateCartMax3dDTO extends CreateCart {
    @IsArray()
    @ArrayMinSize(1)
    bets: any

    @IsArray()
    @ArrayMinSize(1)
    tienCuoc: any
}

export class CreateCartKenoDTO extends CreateCart {
    @IsArray()
    @ArrayMinSize(1)
    @IsOptional()
    bets: any
}

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