import { ForbiddenException, Injectable } from '@nestjs/common';
import { Lottery, OrderStatus, User } from '@prisma/client';
import { LUCKY_KING_PAYMENT } from 'src/common/constants';
import { LotteryNumber, NumberDetail } from 'src/common/entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateImageDTO } from './dto';
import { ICreateLottery } from './interfaces';

@Injectable()
export class LotteryService {
    constructor(private prismaService: PrismaService) { }

    async getLotteryById(lotteryId: string): Promise<Lottery> {
        const lotteryInfo = await this.prismaService.lottery.findUnique({
            where: { id: lotteryId },
        })

        return lotteryInfo;
    }

    async createLottery(createLotteryData: ICreateLottery, session?) {

        const prismaService = session ? session : this.prismaService;

        const { NumberLottery, cartId, amount, drawCode, drawTime, status, type, userId } = createLotteryData;
        const { level, numberDetail, numberSets } = NumberLottery;

        const lottery = await prismaService.lottery.create({
            data: {
                user: {
                    connect: { id: userId }
                },
                type,
                amount,
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
        else throw new ForbiddenException("Vé sổ xố này không còn tồn tại nữa")
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
