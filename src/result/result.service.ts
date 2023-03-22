import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LotteryType } from 'src/common/enum';
import { getNearestTimeDay, getTimeToday } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { OldResultKenoDTO, OldResultMegaDTO, OldResultPowerDTO, OldResultMax3dDTO, ScheduleKenoDTO, ScheduleMax3dDTO } from './dto';

@Injectable()
export class ResultService {

    constructor(private prismaService: PrismaService) { }
    private readonly logger = new Logger(ResultService.name);

    // @Cron('0 25 11 * * *')
    // @Cron(CronExpression.EVERY_10_SECONDS)
    // async test () {
    //     const now = new Date()
    //     this.logger.debug(now.getDay());
    //     console.log(parseInt("00855"))
    // }

    // Kế hoạch adđ schedule: 

    // Mega645:
    // - Quay thưởng Từ 18h00 – 18h30 Thứ 4 - Thứ 6 - Chủ nhật 
    // - Khi khởi tạo dự án, insert sẵn lịch quay cho 3 tuần tiếp theo 
    // - Lập lịch mỗi (5:00 AM Thứ hai) hàng tuần add schedule cho tuần tiếp theo (luôn đi trước 3 tuần)
    @Cron('0 5 * * 1')
    async addMegaDrawSchedule() {
        const latestDraw = await this.prismaService.resultMega.findMany({
            orderBy: {
                drawCode: 'desc'
            },
            take: 1
        });
        let latestCode = latestDraw[0].drawCode
        // thu 4
        latestCode++
        let newTime = getNearestTimeDay(3, 18, 0)
        this.addScheduleMega(latestCode, newTime)
        // thu 6
        latestCode++
        newTime = getNearestTimeDay(5, 18, 0)
        this.addScheduleMega(latestCode, newTime)
        // chu nhat
        latestCode++
        newTime = getNearestTimeDay(0, 18, 0)
        this.addScheduleMega(latestCode, newTime)
    }

    private async addScheduleMega(drawCode: number, drawTime: Date) {
        const tmp = await this.prismaService.resultMega.create({
            data: {
                drawn: false,
                drawCode: drawCode,
                drawTime: drawTime
            }
        })
        return tmp
    }


    // Power655:
    // - Quay thưởng Từ 18h00 – 18h30 Thứ 3 - Thứ 5 - Thứ 7
    // - Khi khởi tạo dự án, insert sẵn lịch quay cho 3 tuần tiếp theo 
    // - Lập lịch mỗi (5:00 AM Chủ Nhật) hàng tuần add schedule cho tuần tiếp theo (luôn đi trước 3 tuần) 
    @Cron('0 5 * * 0')
    async addPowerDrawSchedule() {
        const latestDraw = await this.prismaService.resultPower.findMany({
            orderBy: {
                drawCode: 'desc'
            },
            take: 1
        });
        let latestCode = latestDraw[0].drawCode
        // thu 3
        latestCode++
        let newTime = getNearestTimeDay(2, 18, 0)
        this.addSchedulePower(latestCode, newTime)
        // thu 5
        latestCode++
        newTime = getNearestTimeDay(4, 18, 0)
        this.addSchedulePower(latestCode, newTime)
        // thu 7
        latestCode++
        newTime = getNearestTimeDay(6, 18, 0)
        this.addSchedulePower(latestCode, newTime)
    }

    private async addSchedulePower(drawCode: number, drawTime: Date) {
        const tmp = await this.prismaService.resultPower.create({
            data: {
                drawn: false,
                drawCode: drawCode,
                drawTime: drawTime
            }
        })
        return tmp
    }

    // Max3d, Max3d+:
    // - Quay thưởng Từ 18h00 – 18h30 Thứ 2 - Thứ 4 - Thứ 6
    // - Khi khởi tạo dự án, insert sẵn lịch quay cho 3 tuần tiếp theo 
    // - Lập lịch mỗi (5:00 AM Thứ 7) hàng tuần add schedule cho tuần tiếp theo (luôn đi trước 3 tuần) 
    @Cron('0 5 * * 6')
    async addMax3dDrawSchedule() {
        const latestDraw = await this.prismaService.resultMax3d.findMany({
            where: { type: LotteryType.Max3D },
            orderBy: {
                drawCode: 'desc'
            },
            take: 1
        });
        let latestCode = latestDraw[0].drawCode
        // thu 3
        latestCode++
        let newTime = getNearestTimeDay(1, 18, 0)
        this.addScheduleMax3d(latestCode, newTime)
        // thu 5
        latestCode++
        newTime = getNearestTimeDay(3, 18, 0)
        this.addScheduleMax3d(latestCode, newTime)
        // thu 7
        latestCode++
        newTime = getNearestTimeDay(5, 18, 0)
        this.addScheduleMax3d(latestCode, newTime)
    }

    private async addScheduleMax3d(drawCode: number, drawTime: Date) {
        const tmp = await this.prismaService.resultMax3d.create({
            data: {
                drawn: false,
                drawCode: drawCode,
                drawTime: drawTime,
                type: LotteryType.Max3D
            }
        })
        return tmp
    }

    // Max3d Pro:
    // - Quay thưởng Từ 18h00 – 18h30 Thứ 3 - Thứ 5 - Thứ 7
    // - Khi khởi tạo dự án, insert sẵn lịch quay cho 3 tuần tiếp theo 
    // - Lập lịch mỗi (4:00 AM Thứ hai) hàng tuần add schedule cho tuần tiếp theo (luôn đi trước 3 tuần) 
    @Cron('0 4 * * 0')
    async addMax3dProDrawSchedule() {
        const latestDraw = await this.prismaService.resultMax3d.findMany({
            where: { type: LotteryType.Max3DPro },
            orderBy: {
                drawCode: 'desc'
            },
            take: 1
        });
        let latestCode = latestDraw[0].drawCode
        // thu 3
        latestCode++
        let newTime = getNearestTimeDay(2, 18, 0)
        this.addScheduleMax3dPro(latestCode, newTime)
        // thu 5
        latestCode++
        newTime = getNearestTimeDay(4, 18, 0)
        this.addScheduleMax3dPro(latestCode, newTime)
        // thu 7
        latestCode++
        newTime = getNearestTimeDay(6, 18, 0)
        this.addScheduleMax3dPro(latestCode, newTime)
    }

    private async addScheduleMax3dPro(drawCode: number, drawTime: Date) {
        const tmp = await this.prismaService.resultMax3d.create({
            data: {
                drawn: false,
                drawCode: drawCode,
                drawTime: drawTime,
                type: LotteryType.Max3DPro
            }
        })
        return tmp
    }

    // Keno:
    // - Quay thưởng 5p 1 lần, từ 6h04 sáng đến 21h54 tối
    // - Khi khởi tạo dự án, insert sẵn lịch quay cho 3 ngày tiếp theo 
    // - Lập lịch mỗi (3:00 AM  hàng ngày) add schedule cho ngày tiếp theo (luôn đi trước 3 ngày) 
    @Cron('0 3 * * *')
    async addKenoDrawSchedule() {
        const latestDraw = await this.prismaService.resultKeno.findMany({
            orderBy: {
                drawCode: 'desc'
            },
            take: 1
        });
        let check = true
        let newDrawCode = latestDraw[0].drawCode
        const time5h59Today = getTimeToday(5, 59)
        let newTime = time5h59Today
        const time21h54Today = getTimeToday(21, 54)
        while (check) {
            newDrawCode++
            newTime = new Date(newTime.getTime() + 5 * 60000);
            await this.prismaService.resultKeno.create({
                data: {
                    drawn: false,
                    drawCode: newDrawCode,
                    drawTime: newTime
                }
            })
            if (newTime.getTime() >= time21h54Today.getTime()) check = false
        }
    }

    // Insert old result 
    async insertOldResultKeno(body: OldResultKenoDTO) {
        const result = this.prismaService.resultKeno.create({
            data: {
                drawn: true,
                drawCode: parseInt(body.drawCode.toString()),
                drawTime: body.drawTime,
                result: body.result
            }
        })
        return result
    }

    async insertOldResultPower(body: OldResultPowerDTO) {
        const result = this.prismaService.resultPower.create({
            data: {
                drawn: true,
                drawCode: parseInt(body.drawCode.toString()),
                drawTime: body.drawTime,
                result: body.result,
                specialNumber: body.specialNumber
            }
        })
        return result
    }

    async insertOldResultMega(body: OldResultMegaDTO) {
        const result = this.prismaService.resultMega.create({
            data: {
                drawn: true,
                drawCode: parseInt(body.drawCode.toString()),
                drawTime: body.drawTime,
                result: body.result
            }
        })
        return result
    }

    async insertOldResultMax3d(body: OldResultMax3dDTO) {
        const result = this.prismaService.resultMax3d.create({
            data: {
                drawn: true,
                drawCode: parseInt(body.drawCode.toString()),
                drawTime: body.drawTime,
                type: body.type,
                first: body.first,
                second: body.second,
                third: body.third,
                consolation: body.consolation
            }
        })
        return result
    }
    // ------ End --------

    // Insert Schedule Manual
    async insertScheduleKeno(body: ScheduleKenoDTO) {
        const result = this.prismaService.resultKeno.create({
            data: {
                drawn: false,
                drawCode: parseInt(body.drawCode.toString()),
                drawTime: body.drawTime,
            }
        })
        return result
    }

    async insertScheduleMega(body: ScheduleKenoDTO) {
        return await this.addScheduleMega(body.drawCode, body.drawTime)
    }

    async insertSchedulePower(body: ScheduleKenoDTO) {
        return await this.addSchedulePower(body.drawCode, body.drawTime)
    }

    async insertScheduleMax3d(body: ScheduleMax3dDTO) {
        let tmp
        switch (body.type) {
            case LotteryType.Max3D:
                tmp = await this.addScheduleMax3d(body.drawCode, body.drawTime)
            case LotteryType.Max3DPlus:
                tmp = await this.addScheduleMax3d(body.drawCode, body.drawTime)
            case LotteryType.Max3DPro:
                tmp = await this.addScheduleMax3dPro(body.drawCode, body.drawTime)
                break;

            default:
                break;
        }
        return tmp
    }
    // ------ End -------
}
