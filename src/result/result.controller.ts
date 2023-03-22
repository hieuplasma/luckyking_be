import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ResultPower } from '@prisma/client';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { OldResultKenoDTO, OldResultMax3dDTO, OldResultMegaDTO, OldResultPowerDTO } from './dto';
import { ResultService } from './result.service';

@Controller('result')
export class ResultController {
    constructor(private resultService: ResultService) { }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-old/power')
    @Roles(Role.Staff, Role.Admin)
    insertOldResultPower(@Body() body: OldResultPowerDTO){
        return this.resultService.insertOldResultPower(body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-old/mega')
    @Roles(Role.Staff, Role.Admin)
    insertOldResultMega(@Body() body: OldResultMegaDTO){
        return this.resultService.insertOldResultMega(body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-old/keno')
    @Roles(Role.Staff, Role.Admin)
    insertOldResultKeno(@Body() body: OldResultKenoDTO){
        return this.resultService.insertOldResultKeno(body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-old/max3d')
    @Roles(Role.Staff, Role.Admin)
    insertOldResultMax3e(@Body() body: OldResultMax3dDTO){
        return this.resultService.insertOldResultMax3d(body)
    }
}

