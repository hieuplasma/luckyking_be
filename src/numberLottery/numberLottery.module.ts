import { Module } from '@nestjs/common';
import { NumberLotteryService } from './numberLottery.service';

@Module({
    providers: [NumberLotteryService],
    exports: [NumberLotteryService]
})

export class NumberLotteryModule { }
