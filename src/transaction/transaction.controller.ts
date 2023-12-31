import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { Transaction, User, WithdrawRequest, BalanceFluctuations } from '../../node_modules/.prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { AcceptBankWithdrawDTO, RechargeDTO, WithDrawBankAccountDTO, WithDrawLuckyKingDTO } from './dto';
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
    @Post('withdraw-bank-acount')
    @Roles(Role.User)
    withdrawToBankAccount(@GetUser() transactionPerson: User, @Body() body: WithDrawBankAccountDTO) {
        return this.transactionService.requestWithDrawToBank(transactionPerson, body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('list')
    @Roles(Role.User)
    getListTransaction(@GetUser() me: User) {
        return this.transactionService.getListTransaction(me)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('list-by-userid')
    @Roles(Role.Admin, Role.Staff)
    getListTransactionByUserId(@Query('userId') userId: string) {
        return this.transactionService.getListTransactionByUserId(userId)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('money-account')
    @Roles(Role.User)
    getHistoryMoneyAccount(@GetUser() me: User, @Query('take') take: number, @Query('skip') skip: number): Promise<BalanceFluctuations[]> {
        return this.transactionService.getHistoryMoneyAccount(me.id, skip, take)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('reward-wallet')
    @Roles(Role.User)
    getHistoryRewardWallet(@GetUser() me: User, @Query('take') take: number, @Query('skip') skip: number): Promise<BalanceFluctuations[]> {
        return this.transactionService.getHistoryRewardWallet(me.id, skip, take)
    }
}
