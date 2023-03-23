import { Injectable } from '@nestjs/common';
import { LotteryNumber, NumberDetail } from 'src/common/entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateImageDTO } from './dto';

@Injectable()
export class LotteryService {
    constructor(private prismaService: PrismaService) { }

    async updateImage(body: UpdateImageDTO) {
        const images = await this.prismaService.lottery.findUnique({
            where: { id: body.lotteryId },
            select: { imageFront: true, imageBack: true }
        })
        const update = await this.prismaService.lottery.update({
            data: {
                imageFront: body.imageFront || images.imageFront,
                imageBack: body.imageBack || images.imageBack
            },
            where: { id: body.lotteryId }
        })
        return update
    }

    async calculateTotalBets(lotteryId: string) {
        const lottery = await this.prismaService.lottery.findUnique({
            where: { id: lotteryId },
            include: { NumberLottery: true }
        })
        let total = 0;
        const detail =lottery.NumberLottery.numberDetail
        console.log(detail)
        const numberDetail: NumberDetail[] = JSON.parse(detail.toString())
        console.log(numberDetail)
        numberDetail.map(item => total = total +parseInt(item.tienCuoc))
        console.log(total)
    }

}
