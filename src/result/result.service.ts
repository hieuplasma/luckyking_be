import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JackPot, OrderStatus, User } from '@prisma/client';
import { WARNING_REWARD } from 'src/common/constants';
import { NumberDetail } from 'src/common/entity';
import { LotteryType } from 'src/common/enum';
import { caculateKenoBenefits, caculateMax3dBenefits, caculateMax3dProBenefits, caculateMax3PlusdBenefits, caculateMegaBenefits, caculatePowerBenefits, getNearestTimeDay, getTimeToday, serializeBigInt } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { TransactionService } from 'src/transaction/transaction.service';
import { OldResultKenoDTO, OldResultMegaDTO, OldResultPowerDTO, OldResultMax3dDTO, ScheduleKenoDTO, ScheduleMax3dDTO, UpdateResultKenoDTO, JackPotDTO, UpdateResultPowerDTO, UpdateResultMax3dDTO } from './dto';

@Injectable()
export class ResultService {

    constructor(private prismaService: PrismaService, private transactionService: TransactionService) { }
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
                drawCode: parseInt(drawCode.toString()),
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
        const result = await this.prismaService.resultKeno.create({
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
        const result = await this.prismaService.resultPower.create({
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
        const result = await this.prismaService.resultMega.create({
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
                special: body.special
            }
        })
        return result
    }
    // ------ End --------

    // Insert Schedule Manual
    async insertScheduleKeno(body: ScheduleKenoDTO) {
        const check = await this.prismaService.resultKeno.findFirst({ where: { drawCode: parseInt(body.drawCode.toString()) } })
        console.log(check)
        if (check) throw new ForbiddenException("Mã kỳ quay đã tồn tại")
        const result = await this.prismaService.resultKeno.create({
            data: {
                drawn: false,
                drawCode: parseInt(body.drawCode.toString()),
                drawTime: body.drawTime,
            }
        })
        return result
    }

    async insertScheduleMega(body: ScheduleKenoDTO) {
        const check = await this.prismaService.resultMega.findFirst({ where: { drawCode: parseInt(body.drawCode.toString()) } })
        if (check) throw new ForbiddenException("Mã kỳ quay đã tồn tại")
        return await this.addScheduleMega(parseInt(body.drawCode.toString()), body.drawTime)
    }

    async insertSchedulePower(body: ScheduleKenoDTO) {
        const check = await this.prismaService.resultPower.findFirst({ where: { drawCode: parseInt(body.drawCode.toString()) } })
        if (check) throw new ForbiddenException("Mã kỳ quay đã tồn tại")
        return await this.addSchedulePower(parseInt(body.drawCode.toString()), body.drawTime)
    }

    async insertScheduleMax3d(body: ScheduleMax3dDTO) {
        const check = await this.prismaService.resultMax3d.findFirst({ where: { drawCode: parseInt(body.drawCode.toString()) } })
        if (check) throw new ForbiddenException("Mã kỳ quay đã tồn tại")
        let tmp
        switch (body.type) {
            case LotteryType.Max3D:
                tmp = await this.addScheduleMax3d(parseInt(body.drawCode.toString()), body.drawTime)
            case LotteryType.Max3DPlus:
                tmp = await this.addScheduleMax3d(parseInt(body.drawCode.toString()), body.drawTime)
            case LotteryType.Max3DPro:
                tmp = await this.addScheduleMax3dPro(parseInt(body.drawCode.toString()), body.drawTime)
                break;

            default:
                break;
        }
        return tmp
    }
    // ------ End -------

    // View Result 
    async getResultMax3d(type: string, take: number, skip: number) {
        const now = new Date()
        const schedule = await this.prismaService.resultMax3d.findMany({
            where: { drawn: true, type: type, drawTime: { lt: now } },
            orderBy: { drawCode: 'desc' },
            take: take ? parseInt(take.toString()) : 10,
            skip: skip ? parseInt(skip.toString()) : 0
        })
        return schedule
    }

    async getResultKeno(take: number, skip: number) {
        const now = new Date()
        const schedule = await this.prismaService.resultKeno.findMany({
            where: { drawn: true, drawTime: { lt: now } },
            orderBy: { drawCode: 'desc' },
            take: take ? parseInt(take.toString()) : 20,
            skip: skip ? parseInt(skip.toString()) : 0
        })
        return schedule
    }

    async getResultMega(take: number, skip: number) {
        const now = new Date()
        const schedule = await this.prismaService.resultMega.findMany({
            where: { drawn: true, drawTime: { lt: now } },
            orderBy: { drawCode: 'desc' },
            take: take ? parseInt(take.toString()) : 10,
            skip: skip ? parseInt(skip.toString()) : 0
        })
        return schedule
    }

    async getResultPower(take: number, skip: number) {
        const now = new Date()
        const schedule = await this.prismaService.resultPower.findMany({
            where: { drawn: true, drawTime: { lt: now } },
            orderBy: { drawCode: 'desc' },
            take: take ? parseInt(take.toString()) : 10,
            skip: skip ? parseInt(skip.toString()) : 0
        })
        return schedule
    }
    // ------ End -------

    // Get Schedule 
    async getScheduleMax3d(type: string, take: number, skip: number) {
        const now = new Date()
        const schedule = await this.prismaService.resultMax3d.findMany({
            where: { drawn: false, type: type, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
            take: take ? parseInt(take.toString()) : 6,
            skip: skip ? parseInt(skip.toString()) : 0
        })
        return schedule
    }

    async getScheduleKeno(take: number, skip: number) {
        const now = new Date()
        const schedule = await this.prismaService.resultKeno.findMany({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
            take: take ? parseInt(take.toString()) : 20,
            skip: skip ? parseInt(skip.toString()) : 0
        })
        return schedule
    }

    async getScheduleMega(take: number, skip: number) {
        const now = new Date()
        const schedule = await this.prismaService.resultMega.findMany({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
            take: take ? parseInt(take.toString()) : 6,
            skip: skip ? parseInt(skip.toString()) : 0
        })
        return schedule
    }

    async getSchedulePower(take: number, skip: number) {
        const now = new Date()
        const schedule = await this.prismaService.resultPower.findMany({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
            take: take ? parseInt(take.toString()) : 6,
            skip: skip ? parseInt(skip.toString()) : 0
        })
        return schedule
    }
    // ------ End ------


    // Update Result 
    async updateResultMax3d(transactionPerson: User, body: UpdateResultMax3dDTO) {
        const drawCode = parseInt(body.drawCode.toString())
        const draw = await this.prismaService.resultMax3d.findFirst({
            where: { drawCode: drawCode, type: body.type }
        })
        if (!draw) throw new ForbiddenException("Mã kỳ quay không tồn tại")
        if (draw.drawn) throw new ForbiddenException("Kỳ quay này đã được cập nhật kết quả")
        // Cap nhat ket qua
        const update = await this.prismaService.resultMax3d.update({
            where: { id: draw.id },
            data: {
                drawn: true, special: body.special,
                first: body.first, second: body.second, third: body.third
            }
        })
        // so ve va update ve
        let listLottery: any[]
        if (body.type == LotteryType.Max3DPro)
            listLottery = await this.prismaService.lottery.findMany({
                where: { drawCode: drawCode, status: OrderStatus.CONFIRMED, type: body.type },
                include: { NumberLottery: true }
            })
        else {
            listLottery = await this.prismaService.lottery.findMany({
                where: { drawCode: drawCode, status: OrderStatus.CONFIRMED, type: {in: [LotteryType.Max3D, LotteryType.Max3DPlus]} },
                include: { NumberLottery: true }
            })
        }
        listLottery.map(async lottery => {
            let benefits = 0
            switch (body.type) {
                case LotteryType.Max3D:
                    // So ve xem trung khong
                    benefits = caculateMax3dBenefits(lottery, body.special, body.first, body.second, body.third)
                    break;
                case LotteryType.Max3DPlus:
                    // So ve xem trung khong
                    benefits = caculateMax3PlusdBenefits(lottery, body.special, body.first, body.second, body.third)
                case LotteryType.Max3DPlus:
                    // So ve xem trung khong
                    benefits = caculateMax3dProBenefits(lottery, body.special, body.first, body.second, body.third)
                default:
                    break;
            }
            // Tra thuong
            this.rewardLottery(benefits, update.drawTime, lottery, transactionPerson.id)
        })
        return update
    }

    async updateResultKeno(transactionPerson: User, body: UpdateResultKenoDTO) {
        const drawCode = parseInt(body.drawCode.toString())
        const draw = await this.prismaService.resultKeno.findUnique({
            where: { drawCode: drawCode }
        })
        if (!draw) throw new ForbiddenException("Mã kỳ quay không tồn tại")
        if (draw.drawn) throw new ForbiddenException("Kỳ quay này đã được cập nhật kết quả")
        // Cap nhat ket qua
        const update = await this.prismaService.resultKeno.update({
            where: { drawCode: drawCode },
            data: { drawn: true, result: body.result }
        })
        // so ve va update ve
        const listLottery = await this.prismaService.lottery.findMany({
            where: { drawCode: drawCode, status: OrderStatus.CONFIRMED, type: LotteryType.Keno },
            include: { NumberLottery: true }
        })
        listLottery.map(async lottery => {
            // So ve xem trung khong
            let benefits = caculateKenoBenefits(lottery, body.result)
            // Tra thuong
            this.rewardLottery(benefits, update.drawTime, lottery, transactionPerson.id)
        })
        return update
    }

    async updateResultMega(transactionPerson: User, body: UpdateResultKenoDTO) {
        const drawCode = parseInt(body.drawCode.toString())
        const draw = await this.prismaService.resultMega.findUnique({
            where: { drawCode: drawCode }
        })
        if (!draw) throw new ForbiddenException("Mã kỳ quay không tồn tại")
        if (draw.drawn) throw new ForbiddenException("Kỳ quay này đã được cập nhật kết quả")

        // Cap nhat ket qua
        const update = await this.prismaService.resultMega.update({
            where: { drawCode: drawCode },
            data: { drawn: true, result: body.result }
        })
        const jackPot: JackPot = JSON.parse(await this.getJackPot())
        // so ve va update ve
        const listLottery = await this.prismaService.lottery.findMany({
            where: { drawCode: drawCode, status: OrderStatus.CONFIRMED, type: LotteryType.Mega },
            include: { NumberLottery: true }
        })
        listLottery.map(async lottery => {
            // So ve xem trung khong
            let benefits = caculateMegaBenefits(lottery, body.result, parseInt(jackPot.JackPotMega.toString()))
            // Tra thuong
            this.rewardLottery(benefits, update.drawTime, lottery, transactionPerson.id)
        })
        return update
    }

    async updateResultPower(transactionPerson: User, body: UpdateResultPowerDTO) {
        const drawCode = parseInt(body.drawCode.toString())
        const draw = await this.prismaService.resultPower.findUnique({
            where: { drawCode: drawCode }
        })
        if (!draw) throw new ForbiddenException("Mã kỳ quay không tồn tại")
        if (draw.drawn) throw new ForbiddenException("Kỳ quay này đã được cập nhật kết quả")
        // Cap nhat ket qua
        const update = await this.prismaService.resultPower.update({
            where: { drawCode: drawCode },
            data: { drawn: true, result: body.result, specialNumber: parseInt(body.specialNumber.toString()) }
        })
        const jackPot: JackPot = JSON.parse(await this.getJackPot())
        // so ve va update ve
        const listLottery = await this.prismaService.lottery.findMany({
            where: { drawCode: drawCode, status: OrderStatus.CONFIRMED, type: LotteryType.Power },
            include: { NumberLottery: true }
        })
        listLottery.map(async lottery => {
            // So ve xem trung khong
            let benefits = caculatePowerBenefits(
                lottery, body.result,
                parseInt(body.specialNumber.toString()),
                parseInt(jackPot.JackPot1Power.toString()),
                parseInt(jackPot.JackPot2Power.toString()))
            this.rewardLottery(benefits, update.drawTime, lottery, transactionPerson.id)
        })
        return update
    }

    private async rewardLottery(benefits: number, drawTime: Date, lottery: any, transactionPersonId: string) {
        if (benefits == 0) await this.prismaService.lottery.update({
            data: { status: OrderStatus.NO_PRIZE, resultTime: drawTime },
            where: { id: lottery.id }
        })
        if (benefits > WARNING_REWARD) {
            await this.prismaService.lottery.update({
                data: { status: OrderStatus.WON, resultTime: drawTime, benefits: benefits },
                where: { id: lottery.id }
            })
        }
        // Neu trung thi tao transaction tra thuong
        if (benefits > 0 && benefits <= WARNING_REWARD) {
            await this.transactionService.rewardLottery(lottery.userId, benefits, transactionPersonId, lottery.type)
            await this.prismaService.lottery.update({
                data: { status: OrderStatus.PAID, resultTime: drawTime, benefits: benefits },
                where: { id: lottery.id }
            })
        }
        // Service ban notify cho nguoi dung o day .........
    }
    // ------ End ------

    //Update JackPot
    async updateJackPot(body: JackPotDTO) {
        const oldJackPot = await this.prismaService.jackPot.findFirst({ where: {} })
        if (oldJackPot) {
            console.log('update')
            // update
            const jackpot1Power = body.jackpot1Power ? BigInt(body.jackpot1Power.toString()) : oldJackPot.JackPot1Power
            const jackpot2Power = body.jackpot2Power ? BigInt(body.jackpot2Power.toString()) : oldJackPot.JackPot2Power
            const jackPotMega = body.jackpotMega ? BigInt(body.jackpotMega.toString()) : oldJackPot.JackPotMega
            const update = await this.prismaService.jackPot.update({
                where: { id: oldJackPot.id },
                data: {
                    JackPot1Power: jackpot1Power,
                    JackPot2Power: jackpot2Power,
                    JackPotMega: jackPotMega
                }, select: { JackPot1Power: true, JackPot2Power: true, JackPotMega: true }
            })
            return serializeBigInt(update)
        }
        else {
            //create
            console.log('create')
            const jackpot1Power = body.jackpot1Power ? BigInt(body.jackpot1Power.toString()) : 0
            const jackpot2Power = body.jackpot2Power ? BigInt(body.jackpot2Power.toString()) : 0
            const jackPotMega = body.jackpotMega ? BigInt(body.jackpotMega.toString()) : 0
            const create = await this.prismaService.jackPot.create({
                data: {
                    JackPot1Power: jackpot1Power,
                    JackPot2Power: jackpot2Power,
                    JackPotMega: jackPotMega
                }, select: { JackPot1Power: true, JackPot2Power: true, JackPotMega: true }
            })
            return serializeBigInt(create)
        }
    }

    async getJackPot() {
        const jackpot = await this.prismaService.jackPot.findFirst({
            select: { JackPot1Power: true, JackPot2Power: true, JackPotMega: true }
        })
        return serializeBigInt(jackpot)
    }
    // ------ End ------
}
