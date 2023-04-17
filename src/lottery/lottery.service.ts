import { ForbiddenException, Injectable } from '@nestjs/common';
import { createWriteStream } from 'fs';
import { LotteryNumber, NumberDetail } from 'src/common/entity';
import { dateConvert } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateImageDTO } from './dto';

@Injectable()
export class LotteryService {
    constructor(private prismaService: PrismaService) { }

    async updateImage(body: UpdateImageDTO, imgFront: Express.Multer.File, imgBack: Express.Multer.File) {
        const images = await this.prismaService.lottery.findUnique({
            where: { id: body.lotteryId },
            select: { imageFront: true, imageBack: true }
        })

        if (images) {
            const filename = 'src/lottery/images/' + dateConvert(new Date()) + "_front_" + body.lotteryId + '.png';
            const ws = createWriteStream(filename)
            ws.write(imgFront.buffer)

            const filename2 = 'src/lottery/images/' + dateConvert(new Date()) + "_back_" + body.lotteryId + '.png';
            const ws2 = createWriteStream(filename2)
            ws2.write(imgBack.buffer)
            const update = await this.prismaService.lottery.update({
                data: {
                    imageFront: body.imageFront || images.imageFront,
                    imageBack: body.imageBack || images.imageBack
                },
                where: { id: body.lotteryId }
            })
            return update
        }
        else throw new ForbiddenException("Vé sổ xố này không còn tồn tại nữa")
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
        numberDetail.map(item => total = total + parseInt(item.tienCuoc))
        console.log(total)
    }

}
