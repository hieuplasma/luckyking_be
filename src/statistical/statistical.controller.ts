import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { StatisticalService } from './statistical.service';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Roles } from 'src/auth/decorator';
import { Role } from 'src/common/enum';

@Controller('statistical')
export class StatisticalController {
    constructor(private statisticalService: StatisticalService) { }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('keno-number')
    @Roles(Role.User)
    statisticalKenoNumber(@Query('take') take: number) {
        return this.statisticalService.statisticalKenoNumber(take)
    }
}
