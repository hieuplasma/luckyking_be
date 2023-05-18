import { ForbiddenException, Injectable } from '@nestjs/common';
import { INumberDetail, NumberDetail } from 'src/common/entity';
import { PrismaService } from 'src/prisma/prisma.service';


@Injectable()
export class NumberLotteryService {
    constructor(private prismaService: PrismaService) { }

    async deleteNumberDetail(numberLotteryId: string, position: number) {
        const find = await this.prismaService.numberLottery.findUnique({ where: { id: numberLotteryId } })
        if (!find) throw new ForbiddenException("Record to delete does not exist")

        const numberDetail = find.numberDetail as INumberDetail[]

        if (numberDetail.length == 1) return { errorMessage: "Vé chỉ có một bộ số", errorCode: "DEL001" }
        numberDetail.splice(position, 1);

        const updatedNumberLottery = await this.prismaService.numberLottery.update({
            where: { id: numberLotteryId },
            data: {
                numberDetail: JSON.stringify(numberDetail),
                numberSets: { decrement: 1 }
            }
        })

        return updatedNumberLottery
    }
}