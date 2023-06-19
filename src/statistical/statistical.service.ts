import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatisticalService {

    constructor(
        private prismaService: PrismaService
    ) { }

    async statisticalKenoNumber(take: number) {
        const list = await this.prismaService.resultKeno.findMany({
            where: { drawn: true },
            orderBy: { drawCode: 'desc' },
            take: take ? take : 10
        })

        const appearArr = Array(81).fill(0)

        for (const element of list) {
            const result = element.result.split("-")
            for (const number of result) {
                appearArr[number]++
            }
        }
    }
}
