import { ForbiddenException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { Lottery, OrderStatus, Prisma, User } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { FIREBASE_MESSAGE, FIREBASE_TITLE, TIMEZONE } from 'src/common/constants/constants';
import { LUCKY_KING_PAYMENT } from 'src/common/constants';
import { INumberDetail, LotteryNumber, NumberDetail } from 'src/common/entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateImageDTO } from './dto';
import { ICreateLottery, IUpdateLotteryNumber } from './interfaces';
import fs from 'fs'
import { caculateSurcharge, nDate } from 'src/common/utils';
import { LotteryType } from 'src/common/enum';
import FirebaseService from '../firebase/firebase-app'
import { KenoSocketService } from 'src/webSocket/kenoWebSocket.service';
import { printCode } from 'src/common/utils/other.utils';
import { errorMessage } from 'src/common/error_message';

@Injectable()
export class LotteryService implements OnModuleInit {
    constructor(
        private prismaService: PrismaService,
        private firebaseService: FirebaseService,
        private kenoSocketService: KenoSocketService,
    ) { }

    onModuleInit() {
        this.kenoSchedule();
    }

    async getLotteryById(lotteryId: string): Promise<Lottery> {
        const lotteryInfo = await this.prismaService.lottery.findUnique({
            where: { id: lotteryId },
        })

        return lotteryInfo;
    }

    // This function can be optimized in the future
    async getKenoPendingByDisplayId(displayId: string): Promise<Lottery> {
        const now = new nDate()
        const schedule = await this.prismaService.resultKeno.findFirst({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
        });

        const kenoPendingLottery = await this.prismaService.lottery.findFirst({
            where: {
                displayId: +displayId,
                status: OrderStatus.PENDING,
                drawCode: schedule.drawCode,
                type: LotteryType.Keno,
            },
            include: {
                Order: true,
                NumberLottery: true
            }
        })

        return kenoPendingLottery;
    }

    async getKenoNextPending(user: User): Promise<Lottery[]> {
        const now = new nDate()
        const schedule = await this.prismaService.resultKeno.findFirst({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
        });

        // Update lottery expired
        await this.prismaService.lottery.updateMany({
            where: {
                type: LotteryType.Keno,
                drawTime: { lte: now },
                status: OrderStatus.PENDING,
            },
            data: {
                drawCode: schedule.drawCode,
                drawTime: schedule.drawTime,
            }
        })

        let Lotteries = await this.prismaService.lottery.findMany({
            where: {
                type: LotteryType.Keno,
                drawCode: schedule.drawCode,
                status: { in: [OrderStatus.PENDING, OrderStatus.PRINTED] },
                assignedStaffId: user.id,
            },
            orderBy: {
                Order: {
                    displayId: 'asc'
                }
            },
            include: {
                Order: true,
                NumberLottery: true
            }
        });

        if (Lotteries.length === 0) {
            await this.prismaService.$transaction(async (tx) => {
                Lotteries = await tx.lottery.findMany({
                    where: {
                        type: LotteryType.Keno,
                        drawCode: schedule.drawCode,
                        status: { in: [OrderStatus.PENDING, OrderStatus.PRINTED] },
                        assignedStaffId: null,
                    },
                    orderBy: {
                        Order: {
                            displayId: 'asc'
                        }
                    },
                    take: 2,
                    include: {
                        Order: true,
                        NumberLottery: true
                    }
                });

                await tx.lottery.updateMany({
                    where: {
                        id: { in: Lotteries.map(lottery => lottery.id) }
                    },
                    data: {
                        assignedStaffId: user.id,
                    }
                })
            })
        }

        return Lotteries;
    }

    async confirmLottery(user: User, lotteryId: string): Promise<Lottery> {
        const now = new nDate();
        const confirmedLottery = await this.prismaService.lottery.update({
            where: {
                id: lotteryId,
            },
            data: {
                status: OrderStatus.CONFIRMED,
                confirmedAt: now,
                assignedStaffId: user.id,
            },
            include: { Order: { include: { Lottery: true } } }
        })

        this.kenoSocketService.confirmLottery(lotteryId);

        for (const lottery of confirmedLottery.Order.Lottery) {
            const statusBeforeConfirmed: OrderStatus[] = [OrderStatus.PENDING, OrderStatus.LOCK, OrderStatus.PRINTED];
            if (statusBeforeConfirmed.includes(lottery.status)) {
                return confirmedLottery;
            }
        }

        await this.prismaService.order.update({
            where: {
                id: confirmedLottery.orderId,
            },
            data: {
                status: OrderStatus.CONFIRMED,
                confirmAt: now,
                confirmBy: user.fullName,
                confrimUserId: user.id,
            }
        })

        this.firebaseService.senNotificationToUser(
            confirmedLottery.userId,
            FIREBASE_TITLE.PRINTED_LOTTERY,
            FIREBASE_MESSAGE.PRINTED_LOTTERY
                .replace('ma_don_hang', printCode(confirmedLottery.Order.displayId))
        )

        return confirmedLottery;
    }

    async updateLotteryNumbers(lotteryId: string, data: IUpdateLotteryNumber) {
        const { NumberLottery } = data;
        const { numbers } = NumberLottery;

        try {

            const numberLotteryToUpdate = await this.prismaService.numberLottery.findUnique({
                where: { lotteryId }
            })

            const numberDetail = numberLotteryToUpdate.numberDetail

            for (let i = 0; i < numbers.length; i++) {
                numberDetail[i].boSo = numbers[i];
            }

            const updatedLottery = await this.prismaService.numberLottery.update({
                where: {
                    lotteryId
                },
                data: {
                    numberDetail: numberDetail,
                }
            })
            return updatedLottery;
        } catch (error) {
            throw new ForbiddenException(errorMessage.UNABLE_UPDATE_LOTTERY);
        }
    }

    async createLottery(createLotteryData: ICreateLottery, session?) {

        const prismaService = session ? session : this.prismaService;

        const { NumberLottery, cartId, amount, bets, drawCode, drawTime, status, type, userId } = createLotteryData;
        const { level, numberDetail, numberSets } = NumberLottery;

        const lottery = await prismaService.lottery.create({
            data: {
                user: {
                    connect: { id: userId }
                },
                type,
                amount,
                bets,
                status,
                drawCode,
                drawTime,
                NumberLottery: {
                    create: {
                        level,
                        numberSets,
                        numberDetail,
                    }
                },
                Cart: {
                    connect: { id: cartId }
                },
            },
            include: { NumberLottery: true }
        })

        return lottery
    }

    async createLotteryFromCart(user: User, lotteryId: string, orderId: string, percent = 0, session?) {
        const prismaService = session ? session : this.prismaService;
        const amount = await prismaService.lottery.findUnique({
            where: { id: lotteryId },
            select: {
                amount: true
            }
        })

        const lottery = await prismaService.lottery.update({
            where: {
                id: lotteryId,
            },
            data: {
                Order: {
                    connect: { id: orderId }
                },
                Cart: {
                    disconnect: true,
                },
                status: OrderStatus.PENDING,
                surcharge: caculateSurcharge(amount.amount, percent)
            }
        })

        return lottery
    }

    async getLotteriesByCartId(cartId: string): Promise<Lottery[]> {
        const Lotteries = await this.prismaService.lottery.findMany({
            where: { cartId, status: OrderStatus.CART },
            include: { NumberLottery: true }
        })

        return Lotteries;
    }

    async updateImage(body: UpdateImageDTO, imgFront: Express.Multer.File, imgBack: Express.Multer.File) {
        const lottery = await this.prismaService.lottery.findUnique({
            where: { id: body.lotteryId },
            select: { imageFront: true, imageBack: true }
        })

        if (lottery) {

            if (lottery.imageFront) {
                fs.unlink(`uploads/images/${lottery.imageFront}`, () => {
                    console.log('Delete image successfully')
                })
            }

            if (lottery.imageBack) {
                fs.unlink(`uploads/images/${lottery.imageBack}`, () => {
                    console.log('Delete image successfully')
                })
            }

            const update = await this.prismaService.lottery.update({
                data: {
                    imageFront: imgFront ? `/${imgFront.filename}` : lottery.imageFront,
                    imageBack: imgBack ? `/${imgBack.filename}` : lottery.imageBack
                },
                where: { id: body.lotteryId }
            })
            return update
        }
        else {
            fs.unlink(imgFront.path, () => {
                console.log('Delete image successfully')
            })
            fs.unlink(imgBack.path, () => {
                console.log('Delete image successfully')
            })

            throw new ForbiddenException(errorMessage.LOTTERY_NOT_EXIST);
        }
    }

    async updateKenoImage(body: UpdateImageDTO, imgFront: Express.Multer.File) {
        const lottery = await this.prismaService.lottery.findUnique({
            where: { id: body.lotteryId },
            select: { imageFront: true, imageBack: true }
        })

        if (lottery) {
            if (lottery.imageFront) {
                fs.unlink(`uploads/images/${lottery.imageFront}`, () => {
                    console.log('Delete image successfully')
                })
            }

            const update = await this.prismaService.lottery.update({
                data: {
                    imageFront: imgFront ? `/${imgFront.filename}` : lottery.imageFront,
                    imageBack: imgFront ? `/${imgFront.filename}` : lottery.imageBack,
                },
                where: { id: body.lotteryId }
            })
            return update
        }
        else {
            fs.unlink(imgFront.path, () => {
                console.log('Delete image successfully')
            })

            throw new NotFoundException(errorMessage.LOTTERY_NOT_EXIST);
        }
    }

    async confirmPrintLottery(lotteryId: string): Promise<Boolean> {
        const lottery = await this.prismaService.lottery.findUnique({ where: { id: lotteryId } });
        if (!lottery) throw new NotFoundException(errorMessage.LOTTERY_NOT_EXIST)

        if (lottery.status === OrderStatus.PRINTED || lottery.status === OrderStatus.RETURNED) return false;

        await this.prismaService.lottery.update({
            where: { id: lotteryId },
            data: {
                status: OrderStatus.PRINTED,
            }
        })

        await this.prismaService.order.update({
            where: { id: lottery.orderId },
            data: {
                status: OrderStatus.PRINTED,
            }
        })

        this.kenoSocketService.printLottery(lotteryId);

        return true;
    }

    async setPendingLottery(lotteryId: string): Promise<Boolean> {
        const lottery = await this.prismaService.lottery.findUnique({ where: { id: lotteryId } });
        if (!lottery) throw new NotFoundException(errorMessage.LOTTERY_NOT_EXIST)

        if (lottery.status === OrderStatus.RETURNED) return false;

        await this.prismaService.lottery.update({
            where: { id: lotteryId },
            data: {
                status: OrderStatus.PENDING,
            }
        })

        return true;
    }

    async deleteLottery(lotteryId: string): Promise<Lottery> {
        const find = await this.prismaService.lottery.findUnique({ where: { id: lotteryId } })
        if (!find) throw new NotFoundException(errorMessage.LOTTERY_NOT_EXIST);
        const del = await this.prismaService.lottery.delete({
            where: { id: lotteryId }
        })
        return del
    }

    async deleteLotteryByCartId(cartId: string) {
        return await this.prismaService.lottery.deleteMany({
            where: { cartId }
        })
    }

    async calculateTotalBets(lotteryId: string) {
        const lottery = await this.prismaService.lottery.findUnique({
            where: { id: lotteryId },
            include: { NumberLottery: true }
        })
        let total = 0;
        const detail = lottery.NumberLottery.numberDetail as INumberDetail[]
        detail.map(item => total = total + item.tienCuoc)
    }

    // async revokeAllKenoFromUser(userId: string) {
    //     const updated = await this.prismaService.lottery.updateMany({
    //         where: {
    //             type: LotteryType.Keno,
    //             assignedStaffId: userId,
    //             status: OrderStatus.PENDING
    //         },
    //         data: {
    //             assignedStaffId: null
    //         }
    //     })

    //     if (updated.count > 0) {
    //         const lotteries = await this.prismaService.lottery.findMany({
    //             where: {
    //                 type: LotteryType.Keno,
    //                 status: OrderStatus.PENDING,
    //                 assignedStaffId: null
    //             },
    //         });

    //         this.kenoSocketService.pushLotteriesToQueue(lotteries);
    //     }
    // }

    // @Cron('30 17 * * *', { timeZone: TIMEZONE })
    @Cron('0 18 * * *', { timeZone: TIMEZONE })
    async autoPushPeriodLotteriesInCart() {
        const now = new nDate();
        const day = now.getDay();

        // Power, 3DPro
        if (day === 2 || day === 4 || day === 6) {
            const nextPowerSchedule = await this.prismaService.resultPower.findFirst({
                where: { drawn: false, drawTime: { gt: now } },
                orderBy: { drawCode: 'asc' },
                // skip: 1
            })

            await this.prismaService.lottery.updateMany({
                where: {
                    type: LotteryType.Power,
                    drawTime: { lte: now },
                    status: OrderStatus.CART,
                },
                data: {
                    drawCode: nextPowerSchedule.drawCode,
                    drawTime: nextPowerSchedule.drawTime,
                }
            })

            const next3DProSchedule = await this.prismaService.resultMax3d.findFirst({
                where: { type: LotteryType.Max3DPro, drawn: false, drawTime: { gt: now } },
                orderBy: { drawCode: 'asc' },
                // skip: 1
            })

            await this.prismaService.lottery.updateMany({
                where: {
                    type: LotteryType.Max3DPro,
                    drawTime: { lte: now },
                    status: OrderStatus.CART,
                },
                data: {
                    drawCode: next3DProSchedule.drawCode,
                    drawTime: next3DProSchedule.drawTime,
                }
            })
        }

        // Mega
        if (day === 3 || day === 5 || day === 7) {
            const nextMegaSchedule = await this.prismaService.resultMega.findFirst({
                where: { drawn: false, drawTime: { gt: now } },
                orderBy: { drawCode: 'asc' },
                // skip: 1
            })

            await this.prismaService.lottery.updateMany({
                where: {
                    type: LotteryType.Mega,
                    drawTime: { lte: now },
                    status: OrderStatus.CART,
                },
                data: {
                    drawCode: nextMegaSchedule.drawCode,
                    drawTime: nextMegaSchedule.drawTime,
                }
            })
        }


        // Max3D, 3Dplus
        if (day === 1 || day === 3 || day === 5) {
            const nextMax3DSchedule = await this.prismaService.resultMax3d.findFirst({
                where: { type: LotteryType.Max3D, drawn: false, drawTime: { gt: now } },
                orderBy: { drawCode: 'asc' },
                // skip: 1
            })

            await this.prismaService.lottery.updateMany({
                where: {
                    type: { in: [LotteryType.Max3D, LotteryType.Max3DPlus] },
                    drawTime: { lte: now },
                    status: OrderStatus.CART,
                },
                data: {
                    drawCode: nextMax3DSchedule.drawCode,
                    drawTime: nextMax3DSchedule.drawTime,
                }
            })
        }
    }


    @Cron('4,9,14,19,24,29,34,39,44,49,54,59 6-22 * * *', { timeZone: TIMEZONE })
    async kenoSchedule() {
        const now = new nDate()
        const schedule = await this.prismaService.resultKeno.findFirst({
            where: { drawn: false, drawTime: { gt: now } },
            orderBy: { drawCode: 'asc' },
        });

        // Update lottery expired
        await this.prismaService.lottery.updateMany({
            where: {
                type: LotteryType.Keno,
                drawTime: { lte: now },
                status: OrderStatus.PENDING,
            },
            data: {
                drawCode: schedule.drawCode,
                drawTime: schedule.drawTime,
            }
        })

        const lotteries = await this.prismaService.lottery.findMany({
            where: {
                type: LotteryType.Keno,
                drawCode: schedule.drawCode,
                status: { in: [OrderStatus.PENDING, OrderStatus.PRINTED] }           // Lock??
            },
            orderBy: {
                Order: {
                    displayId: 'asc'
                }
            },
            select: {
                id: true,
                type: true,
                buyTime: true,
                status: true,
                orderId: true,
                userId: true,
                amount: true,
                bets: true,
                displayId: true,
                drawCode: true,
                drawTime: true,
                assignedStaffId: true,
                Order: {
                    select: {
                        id: true,
                        displayId: true
                    }
                },
                NumberLottery: true,
            }
        });

        this.kenoSocketService.resetLotteriesQueue();

        if (lotteries.length) {
            this.firebaseService.sendNotification('Có đơn keno mới');
            this.kenoSocketService.pushLotteriesToQueue(lotteries);
        }
    }
}
