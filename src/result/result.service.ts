import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
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

    @Cron(CronExpression.EVERY_DAY_AT_3PM)
    async addKenoDraw() {
        const now = new Date()
        this.logger.debug(now.getDay());
    }

    async insertOldResultKeno(body: OldResultKenoDTO) {
        const result = this.prismaService.resultKeno.create({
            data: {
                drawn: true,
                drawCode: body.drawCode,
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
                drawCode: body.drawCode,
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
                drawCode: body.drawCode,
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
                drawCode: body.drawCode,
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
