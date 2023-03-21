import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateImageDTO } from './dto';

@Injectable()
export class LotteryService {
    constructor(private prismaService: PrismaService) { }

    async updateImage(body: UpdateImageDTO) {
        const images = await this.prismaService.lottery.findUnique({
            where: { id: body.lotteryId },
            select: {imageFront: true, imageBack: true}
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

}
