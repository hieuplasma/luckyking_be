import { OrderStatus, Prisma } from ".prisma/client";
import { LotteryType } from "src/common/enum";

interface INumberLottery {
    level: number;

    numberSets: number;

    numberDetail: Prisma.JsonValue;
}

export interface ICreateLottery {
    userId: string;

    type: string;

    amount: number;

    status: OrderStatus;

    drawCode: number;

    drawTime: Date;

    NumberLottery: INumberLottery;

    bets?: number[];

    cartId?: string;
}

