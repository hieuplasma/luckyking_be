import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticalService } from './statistical.service';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { LotteryType, Role } from 'src/common/enum';
import { start } from 'repl';

@Controller('statistical')
export class StatisticalController {
    constructor(private statisticalService: StatisticalService) { }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('keno-number')
    @Roles(Role.User)
    statisticalKenoNumber(@Query('take') take: number) {
        return this.statisticalService.statisticalKenoNumber(take)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('keno-headtail')
    @Roles(Role.User)
    statisticalKenoHeadTail(@Query('take') take: number) {
        return this.statisticalService.statisticalKenoHeadTail(take)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('keno-bigsmall')
    @Roles(Role.User)
    statisticalKenoBigSmall(@Query('take') take: number) {
        return this.statisticalService.statisticalKenoBigSmall(take)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('keno-evenodd')
    @Roles(Role.User)
    statisticalKenoEvenOdd(@Query('take') take: number) {
        return this.statisticalService.statisticalKenoEvenOdd(take)
    }

    // Power, Mega
    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('pome-number')
    @Roles(Role.User)
    statisticalPoMeNumber(
        @Query('type') type: LotteryType,
        @Query('start') start: Date,
        @Query('end') end: Date) {
        return this.statisticalService.statisticalPoMeNumber(type, start, end)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('pome-headtail')
    @Roles(Role.User)
    statisticalPoMeHeadtail(
        @Query('type') type: LotteryType,
        @Query('start') start: Date,
        @Query('end') end: Date) {
        return this.statisticalService.statisticalPoMeHeadtail(type, start, end)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('pome-evenodd')
    @Roles(Role.User)
    statisticalPoMeEvenOdd(
        @Query('type') type: LotteryType,
        @Query('start') start: Date,
        @Query('end') end: Date) {
        return this.statisticalService.statisticalPoMeEvenOdd(type, start, end)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('max3d-headtail')
    @Roles(Role.User)
    statisticalMax3dHeadtail(
        @Query('type') type: LotteryType,
        @Query('start') start: Date,
        @Query('end') end: Date) {
        return this.statisticalService.statisticalMax3dHeadtail(type, start, end)
    }
}
