import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '../../node_modules/.prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { RechargeDTO } from './dto';
import { TransactionService } from './transaction.service';

@Controller('transaction')
export class TransactionController {
    constructor(private transactionService: TransactionService) { }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('recharge')
    @Roles(Role.Admin)
    rechargeMoney(@GetUser() transactionPerson: User, @Body() body: RechargeDTO) {
        return this.transactionService.rechargeMoney(transactionPerson, body)
    }
}
