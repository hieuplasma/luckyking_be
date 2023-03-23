import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { OldResultKenoDTO, OldResultMax3dDTO, OldResultMegaDTO, OldResultPowerDTO, ScheduleKenoDTO, ScheduleMax3dDTO, UpdateResultKenoDTO } from './dto';
import { ResultService } from './result.service';

@Controller('result')
export class ResultController {
    constructor(private resultService: ResultService) { }

    // Insert old  result

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-old/power')
    @Roles(Role.Staff, Role.Admin)
    insertOldResultPower(@Body() body: OldResultPowerDTO) {
        return this.resultService.insertOldResultPower(body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-old/mega')
    @Roles(Role.Staff, Role.Admin)
    insertOldResultMega(@Body() body: OldResultMegaDTO) {
        return this.resultService.insertOldResultMega(body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-old/keno')
    @Roles(Role.Staff, Role.Admin)
    insertOldResultKeno(@Body() body: OldResultKenoDTO) {
        return this.resultService.insertOldResultKeno(body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-old/max3d')
    @Roles(Role.Staff, Role.Admin)
    insertOldResultMax3e(@Body() body: OldResultMax3dDTO) {
        return this.resultService.insertOldResultMax3d(body)
    }
    // --------  End ----------

    // Insert Schedule Manual
    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-schedule/power')
    @Roles(Role.Staff, Role.Admin)
    insertSchedulePower(@Body() body: ScheduleKenoDTO) {
        return this.resultService.insertSchedulePower(body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-schedule/mega')
    @Roles(Role.Staff, Role.Admin)
    insertScheduleMega(@Body() body: ScheduleKenoDTO) {
        return this.resultService.insertScheduleMega(body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-schedule/keno')
    @Roles(Role.Staff, Role.Admin)
    insertScheduleKeno(@Body() body: ScheduleKenoDTO) {
        return this.resultService.insertScheduleKeno(body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('insert-schedule/max3d')
    @Roles(Role.Staff, Role.Admin)
    insertScheduleMax3d(@Body() body: ScheduleMax3dDTO) {
        return this.resultService.insertScheduleMax3d(body)
    }
    // --------  End ----------


    // View Result 
    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('keno')
    @Roles(Role.Staff, Role.Admin, Role.User)
    getResultKeno(@Query('take') take: number, @Query('skip') skip: number) {
        return this.resultService.getResultKeno(take, skip)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('max3d')
    @Roles(Role.Staff, Role.Admin, Role.User)
    getResultmax3d(@Query('type') type: string, @Query('take') take: number, @Query('skip') skip: number) {
        return this.resultService.getResultMax3d(type, take, skip)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('power')
    @Roles(Role.Staff, Role.Admin, Role.User)
    getResultPower(@Query('take') take: number, @Query('skip') skip: number) {
        return this.resultService.getResultPower(take, skip)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('mega')
    @Roles(Role.Staff, Role.Admin, Role.User)
    getResultMega(@Query('take') take: number, @Query('skip') skip: number) {
        return this.resultService.getResultMega(take, skip)
    }
    // ------ End -------

    // Get Schedule 
    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('schedule/max3d')
    @Roles(Role.Staff, Role.Admin, Role.User)
    getScheduleMax3d(@Query('type') type: string, @Query('take') take: number, @Query('skip') skip: number) {
        return this.resultService.getScheduleMax3d(type, take, skip)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('schedule/keno')
    @Roles(Role.Staff, Role.Admin, Role.User)
    getScheduleKeno(@Query('take') take: number, @Query('skip') skip: number) {
        return this.resultService.getScheduleKeno(take, skip)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('schedule/mega')
    @Roles(Role.Staff, Role.Admin, Role.User)
    getScheduleMega(@Query('take') take: number, @Query('skip') skip: number) {
        return this.resultService.getScheduleMega(take, skip)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('schedule/power')
    @Roles(Role.Staff, Role.Admin, Role.User)
    getSchedulePower(@Query('take') take: number, @Query('skip') skip: number) {
        return this.resultService.getSchedulePower(take, skip)
    }
    // ------ End ------


    // Update Result 
    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('update/keno')
    @Roles(Role.Staff, Role.Admin)
    updateResultKeno(@GetUser() user , @Body() body: UpdateResultKenoDTO) {
        return this.resultService.updateResultKeno(user,body)
    }
    // ------ End ------
}

