import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { getTimeToday } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { OldResultKenoDTO, OldResultMegaDTO, OldResultPowerDTO, OldResultMax3dDTO } from './dto';

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

    // Power655:
    // - Quay thưởng Từ 18h00 – 18h30 Thứ 3 - Thứ 5 - Thứ 7
    // - Khi khởi tạo dự án, insert sẵn lịch quay cho 3 tuần tiếp theo 
    // - Lập lịch mỗi (5:00 AM Chủ Nhật) hàng tuần add schedule cho tuần tiếp theo (luôn đi trước 3 tuần) 

    // Max3d, Max3d+:
    // - Quay thưởng Từ 18h00 – 18h30 Thứ 2 - Thứ 4 - Thứ 6
    // - Khi khởi tạo dự án, insert sẵn lịch quay cho 3 tuần tiếp theo 
    // - Lập lịch mỗi (5:00 AM Thứ 7) hàng tuần add schedule cho tuần tiếp theo (luôn đi trước 3 tuần) 

    // Max3d Pro:
    // - Quay thưởng Từ 18h00 – 18h30 Thứ 3 - Thứ 5 - Thứ 7
    // - Khi khởi tạo dự án, insert sẵn lịch quay cho 3 tuần tiếp theo 
    // - Lập lịch mỗi (4:00 AM Thứ hai) hàng tuần add schedule cho tuần tiếp theo (luôn đi trước 3 tuần) 

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
            console.log('inserted '+ newTime)
            if (newTime.getTime() >= time21h54Today.getTime()) check = false
        }
    }



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
}
