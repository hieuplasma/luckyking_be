import { OrderStatus } from ".prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from "class-validator";
import { LotteryType } from "src/common/enum";

class NumberLotteryDTO {
    @IsNumber()
    level: number;

    @IsNumber()
    numberSets: number;

    @IsString()
    numberDetail: string;
}

export class CreateLotteryDTO {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsEnum(LotteryType)
    type: string;

    @IsNumber()
    bets: number;

    @IsString()
    status: OrderStatus;

    @IsNumber()
    drawCode: number;

    @IsDate()
    drawTime: Date

    @IsObject()
    @ValidateNested()
    @Type(() => NumberLotteryDTO)
    NumberLottery: NumberLotteryDTO

    @IsString()
    @IsNotEmpty()
    cartId: string
}

