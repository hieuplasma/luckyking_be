import { ForbiddenException, Injectable } from '@nestjs/common';
import { NumberDetail } from 'src/common/entity';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class NumberLotteryService {
    constructor(private prismaService: PrismaService) { }

    async deleteNumberDetail(numberLotteryId: string, position: number) {
        console.log('deleting...')

        const find = await this.prismaService.numberLotery.findUnique({ where: { id: numberLotteryId } })
        if (!find) throw new ForbiddenException("Record to delete does not exist")

        const numberDetail: NumberDetail[] = JSON.parse(find.numberDetail.toString())

        if (numberDetail.length == 1) return { errorMessage: "Vé chỉ có một bộ số", errorCode: "DEL001" }
        numberDetail.splice(position, 1);

        const updatedNumberLottery = await this.prismaService.numberLotery.update({
            where: { id: numberLotteryId },
            data: {
                numberDetail: JSON.stringify(numberDetail),
                numberSets: { decrement: 1 }
            }
        })

        return updatedNumberLottery
    }
}