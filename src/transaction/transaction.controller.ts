import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { Roles } from 'src/auth/decorator';
import { MyJwtGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { RechargeDTO } from './dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
    constructor (private transactionService: TransactionService) {}

    @UseGuards(MyJwtGuard)
    @Post('recharge')
    @Roles(Role.Admin)
    rechargeMoney(@Body() body: RechargeDTO) {
        return this.transactionService.rechargeMoney(body)
    }

}
