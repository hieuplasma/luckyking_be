import { OrderStatus } from ".prisma/client";
import { Type } from "class-transformer";
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsObject, IsString, ValidateNested } from "class-validator";
import { LotteryType } from "src/common/enum";

class NumberLoteryDTO {
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
    @Type(() => NumberLoteryDTO)
    NumberLottery: NumberLoteryDTO

    @IsString()
    @IsNotEmpty()
    cartId: string
}

