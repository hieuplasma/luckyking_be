import { ForbiddenException, Injectable } from '@nestjs/common';
import { Lottery, OrderStatus, User } from '@prisma/client';
import { LUCKY_KING_PAYMENT } from 'src/common/constants';
import { LotteryNumber, NumberDetail } from 'src/common/entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateImageDTO } from './dto';
import { ICreateLottery, IUpdateLotteryNumber } from './interfaces';
import fs from 'fs'

@Injectable()
export class LotteryService {
    constructor(private prismaService: PrismaService) { }

    async getLotteryById(lotteryId: string): Promise<Lottery> {
        const lotteryInfo = await this.prismaService.lottery.findUnique({
            where: { id: lotteryId },
        })

        return lotteryInfo;
    }

    async updateLotteryNumbers(lotteryId: string, data: IUpdateLotteryNumber) {
        const { NumberLottery } = data;
        const { numbers } = NumberLottery;

        const numberLotteryToUpdate = await this.prismaService.numberLottery.findUnique({
            where: { lotteryId }
        })

        const numberDetail = JSON.parse(numberLotteryToUpdate.numberDetail as string);

        for (let i = 0; i < numbers.length; i++) {
            numberDetail[i].boSo = numbers[i];
        }

        const updatedLottery = await this.prismaService.numberLottery.update({
            where: {
                lotteryId
            },
            data: {
                numberDetail: JSON.stringify(numberDetail),
            }
        })

        return updatedLottery;
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

    async createLotteryFromCart(user: User, lotteryId: string, orderId: string, session?) {
        const prismaService = session ? session : this.prismaService;

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
        const images = await this.prismaService.lottery.findUnique({
            where: { id: body.lotteryId },
            select: { imageFront: true, imageBack: true }
        })

        if (images) {
            const update = await this.prismaService.lottery.update({
                data: {
                    imageFront: imgFront ? `/${imgFront.filename}` : images.imageFront,
                    imageBack: imgBack ? `/${imgBack.filename}` : images.imageBack
                },
                where: { id: body.lotteryId }
            })
            return update
        }
        else {
            console.log(imgFront)
            fs.unlink(imgFront.path, () => {
                console.log('Delete image successfully')
            })
            fs.unlink(imgBack.path, () => {
                console.log('Delete image successfully')
            })

            throw new ForbiddenException("Vé sổ xố này không còn tồn tại nữa");
        }
    }

    async updateKenoImage(body: UpdateImageDTO, imgFront: Express.Multer.File) {
        const images = await this.prismaService.lottery.findUnique({
            where: { id: body.lotteryId },
            select: { imageFront: true, imageBack: true }
        })

        if (images) {
            const update = await this.prismaService.lottery.update({
                data: {
                    imageFront: imgFront ? `/${imgFront.filename}` : images.imageFront,
                },
                where: { id: body.lotteryId }
            })
            return update
        }
        else {
            console.log(imgFront)
            fs.unlink(imgFront.path, () => {
                console.log('Delete image successfully')
            })

            throw new ForbiddenException("Vé sổ xố này không còn tồn tại nữa");
        }
    }

    async confirmPrintLottery(lotteryId: string): Promise<Boolean> {
        const lottery = await this.prismaService.lottery.findUnique({ where: { id: lotteryId } });
        if (!lottery) throw new ForbiddenException("Record to delete does not exist")

        if (lottery.status === OrderStatus.PRINTED) return false;

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

        return true;
    }

    async deleteLottery(lotteryId: string): Promise<Lottery> {
        const find = await this.prismaService.lottery.findUnique({ where: { id: lotteryId } })
        if (!find) throw new ForbiddenException("Record to delete does not exist")
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
        const detail = lottery.NumberLottery.numberDetail
        console.log(detail)
        const numberDetail: NumberDetail[] = JSON.parse(detail.toString())
        console.log(numberDetail)
        numberDetail.map(item => total = total + item.tienCuoc)
        console.log(total)
    }
}
