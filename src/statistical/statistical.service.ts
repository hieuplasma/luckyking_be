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
            take: take ? parseInt(take.toString()) : 10
        })

        const countArr = Array(81).fill(0)
        let rareArr = Array(81).fill({ count: 0, status: true })
        let consecutiveArr = Array(81).fill({ count: 0, status: true })

        for (const element of list) {

            const result = element.result.split("-").map(Number)

            for (let index = 1; index < rareArr.length; index++) {
                console.log(index, rareArr[index])
                if (!rareArr[index].status) continue;
                if (!result.includes(index)) {
                    rareArr[index] = { count: rareArr[index].count + 1, status: true }
                }
                else {
                    rareArr[index] = { count: rareArr[index].count, status: false }
                }
            }

            for (let index = 1; index < consecutiveArr.length; index++) {
                if (!consecutiveArr[index].status) continue;
                if (result.includes(index)) {
                    consecutiveArr[index] = { count: consecutiveArr[index].count + 1, status: true }
                }
                else {
                    consecutiveArr[index] = { count: consecutiveArr[index].count, status: false }
                }
            }

            for (const number of result) {
                countArr[number]++
            }
        }

        let appearArr = []
        for (let index = 0; index < countArr.length; index++) {
            appearArr.push([index, countArr[index]])
        }
        appearArr[0][1] = 2000
        appearArr.sort(function (a, b) {
            return b[1] - a[1];
        })

        let rare = []
        for (let index = 0; index < rareArr.length; index++) {
            rare.push([index, rareArr[index].count])
        }
        rare[0][1] = -1
        rare.sort(function (a, b) {
            return b[1] - a[1]
        })

        let consecutive = []
        for (let index = 0; index < consecutiveArr.length; index++) {
            consecutive.push([index, consecutiveArr[index].count])
        }
        consecutive[0][1] = -1
        consecutive.sort(function (a, b) {
            return b[1] - a[1]
        })

        const mostCommon = appearArr.slice(1, 11);
        const leastCommon = appearArr.slice(-10);

        return {
            mostCommon: mostCommon,
            leastCommon: leastCommon,
            rare: rare.slice(0, 10),
            consecutive: consecutive.slice(0, 10)
        }
    }

    async statisticalKenoHeadTail(take: number) {
        const list = await this.prismaService.resultKeno.findMany({
            where: { drawn: true },
            orderBy: { drawCode: 'desc' },
            take: take ? parseInt(take.toString()) : 10
        })

        const startArr = Array(10).fill(0)
        const endArr = Array(10).fill(0)
        for (const element of list) {
            const result = element.result.split("-").map(Number)
            for (const number of result) {
                startArr[Math.floor(number / 10)]++;
                endArr[number % 10]++;
            }
        }

        let start = [], end = []
        for (let index = 0; index < startArr.length; index++) {
            start.push([index, startArr[index]])
        }

        for (let index = 0; index < endArr.length; index++) {
            end.push([index, endArr[index]])
        }

        return {
            start: start,
            end: end
        }
    }

    async statisticalKenoBigSmall(take: number) {
        const list = await this.prismaService.resultKeno.findMany({
            where: { drawn: true },
            orderBy: { drawCode: 'desc' },
            take: take ? parseInt(take.toString()) : 10
        })
    }
}
