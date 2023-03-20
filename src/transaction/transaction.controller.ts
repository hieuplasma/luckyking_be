import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Transaction, User } from '../../node_modules/.prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { RechargeDTO, WithDrawLuckyKingDTO } from './dto';
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

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('withdraw-luckyking')
    @Roles(Role.Admin, Role.User)
    withdrawToLuckyKing(@GetUser() transactionPerson: User, @Body() body: WithDrawLuckyKingDTO) {
        return this.transactionService.withdrawToLuckyKing(transactionPerson, body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('list')
    @Roles(Role.User)
    getListTransaction(@GetUser() me) {
        return this.transactionService.getListTransaction(me)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('list-by-userid')
    @Roles(Role.Admin, Role.Staff)
    getListTransactionByUserId(@Param() userId: string) {
        return this.transactionService.getListTransactionByUserId(userId)
    }
}