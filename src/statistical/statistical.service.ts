import { Injectable } from '@nestjs/common';
import { Prisma, ResultMax3d, ResultMega, ResultPower } from '@prisma/client';
import { LotteryType } from 'src/common/enum';
import { formattedDate, formattedDate2 } from 'src/common/utils';
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
            leastCommon: leastCommon.reverse(),
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

    async statisticalKenoBigSmall(take: number = 10) {
        const list = await this.prismaService.resultKeno.findMany({
            where: { drawn: true },
            orderBy: { drawCode: 'desc' },
            take: take ? parseInt(take.toString()) : 10,
        })

        const response = [];
        const numberOfBigSmall = Array(4).fill(0, 1, 4);
        const averageFrequency = Array(4).fill(0, 1, 4);
        const rangeNoPrizes = Array(4).fill(0, 1, 4);

        const awardDistanceToPresent = Array(4).fill(0, 1, 4);
        const statusDone = Array(4).fill(false, 1, 4)

        numberOfBigSmall[0] = 'numberOfBigSmall';
        averageFrequency[0] = 'averageFrequency';
        rangeNoPrizes[0] = 'rangeNoPrizes';
        awardDistanceToPresent[0] = 'awardDistanceToPresent';

        let maxRangeNoPrizesOfBig = 0;
        let maxRangeNoPrizesOfDraw = 0;
        let maxRangeNoPrizesOfSmall = 0;

        let rangeNoPrizesOfBig = 0;
        let rangeNoPrizesOfDraw = 0;
        let rangeNoPrizesOfSmall = 0;

        for (const element of list) {
            const result = element.result.split("-").map(Number)

            let big = 0, small = 0;

            for (const number of result) {
                if (number <= 40) small++; else big++;
            }

            if (big > 10) {
                numberOfBigSmall[1]++;

                rangeNoPrizesOfBig = 0;
                rangeNoPrizesOfDraw++;
                rangeNoPrizesOfSmall++;

                statusDone[1] = true
            } else if (big === 10) {
                numberOfBigSmall[2]++;

                rangeNoPrizesOfDraw = 0;
                rangeNoPrizesOfBig++;
                rangeNoPrizesOfSmall++;

                statusDone[2] = true
            } else if (big < 10) {
                numberOfBigSmall[3]++;

                rangeNoPrizesOfSmall = 0;
                rangeNoPrizesOfBig++;
                rangeNoPrizesOfDraw++;

                statusDone[3] = true
            }

            if (rangeNoPrizesOfBig > maxRangeNoPrizesOfBig) {
                maxRangeNoPrizesOfBig = rangeNoPrizesOfBig;
            }
            if (rangeNoPrizesOfDraw > maxRangeNoPrizesOfDraw) {
                maxRangeNoPrizesOfDraw = rangeNoPrizesOfDraw;
            }
            if (rangeNoPrizesOfSmall > maxRangeNoPrizesOfSmall) {
                maxRangeNoPrizesOfSmall = rangeNoPrizesOfSmall;
            }

            if (!statusDone[1]) awardDistanceToPresent[1]++
            if (!statusDone[2]) awardDistanceToPresent[2]++
            if (!statusDone[3]) awardDistanceToPresent[3]++
        }

        averageFrequency[1] = numberOfBigSmall[1] ? Math.floor(take * 100 / numberOfBigSmall[1]) / 100 : '-';
        averageFrequency[2] = numberOfBigSmall[2] ? Math.floor(take * 100 / numberOfBigSmall[2]) / 100 : '-';
        averageFrequency[3] = numberOfBigSmall[3] ? Math.floor(take * 100 / numberOfBigSmall[3]) / 100 : '-';

        rangeNoPrizes[1] = maxRangeNoPrizesOfBig;
        rangeNoPrizes[2] = maxRangeNoPrizesOfDraw;
        rangeNoPrizes[3] = maxRangeNoPrizesOfSmall;

        response.push(numberOfBigSmall);
        response.push(averageFrequency);
        response.push(awardDistanceToPresent);
        response.push(rangeNoPrizes);


        // Get lastest results
        const kenoResults = await this.prismaService.resultKeno.findMany({
            where: { drawn: true },
            orderBy: { drawCode: 'desc' },
            take: take ? (parseInt(take.toString()) > 30 ? 30 : parseInt(take.toString())) : 10,
        })

        for (const element of kenoResults) {
            const result = element.result.split("-").map(Number)

            let big = 0, small = 0;

            for (const number of result) {
                if (number <= 40) small++; else big++;
            }

            if (big > 10) {
                response.push([element.drawTime, big, null, null])
            } else if (big === 10) {
                response.push([element.drawTime, null, 10, null])
            } else if (big < 10) {
                response.push([element.drawTime, null, null, small])
            }
        }

        return response;
    }

    async statisticalKenoEvenOdd(take: number = 10) {
        const list = await this.prismaService.resultKeno.findMany({
            where: { drawn: true },
            orderBy: { drawCode: 'desc' },
            take: take ? parseInt(take.toString()) : 10,
        })

        const response = [];
        const numberOfEvenOdd = Array(6).fill(0, 1, 6);
        const averageFrequency = Array(6).fill(0, 1, 6);
        const rangeNoPrizes = Array(6).fill(0, 1, 6);
        const awardDistanceToPresent = Array(6).fill(0, 1, 6);
        const statusDone = Array(6).fill(false, 1, 6)

        numberOfEvenOdd[0] = 'numberOfEvenOdd';
        averageFrequency[0] = 'averageFrequency';
        rangeNoPrizes[0] = 'rangeNoPrizes';
        awardDistanceToPresent[0] = 'awardDistanceToPresent';

        let maxRangeNoPrizesOfEven13 = 0;
        let maxRangeNoPrizesOfEven11_12 = 0;
        let maxRangeNoPrizesOfDraw = 0;
        let maxRangeNoPrizesOfOdd11_12 = 0;
        let maxRangeNoPrizesOfOdd13 = 0;

        let rangeNoPrizesOfEven13 = 0;
        let rangeNoPrizesOfEven11_12 = 0;
        let rangeNoPrizesOfDraw = 0;
        let rangeNoPrizesOfOdd11_12 = 0;
        let rangeNoPrizesOfOdd13 = 0;

        for (const element of list) {
            const result = element.result.split("-").map(Number)
            let even = 0, odd = 0;
            for (const number of result) {
                if (number % 2 == 0) even++; else odd++;
            }

            if (odd < 8) {
                // even_odd = 'even'
                numberOfEvenOdd[1]++;

                rangeNoPrizesOfEven13 = 0;
                rangeNoPrizesOfEven11_12++;
                rangeNoPrizesOfDraw++;
                rangeNoPrizesOfOdd11_12++;
                rangeNoPrizesOfOdd13++;

                statusDone[1] = true
            } else if (odd === 9 || odd === 8) {
                // even_odd = 'even_11_12'
                numberOfEvenOdd[2]++;

                rangeNoPrizesOfEven11_12 = 0;
                rangeNoPrizesOfEven13++;
                rangeNoPrizesOfDraw++;
                rangeNoPrizesOfOdd11_12++;
                rangeNoPrizesOfOdd13++;

                statusDone[2] = true
            } else if (odd === 10) {
                // even_odd = 'draw'
                numberOfEvenOdd[3]++;

                rangeNoPrizesOfEven11_12++;
                rangeNoPrizesOfEven13++;
                rangeNoPrizesOfDraw = 0;
                rangeNoPrizesOfOdd11_12++;
                rangeNoPrizesOfOdd13++;

                statusDone[3] = true
            } else if (odd === 11 || odd === 12) {
                //  even_odd = 'odd_11_12'
                numberOfEvenOdd[4]++;

                rangeNoPrizesOfEven11_12++;
                rangeNoPrizesOfEven13++;
                rangeNoPrizesOfDraw++;
                rangeNoPrizesOfOdd11_12 = 0;
                rangeNoPrizesOfOdd13++;

                statusDone[4] = true
            } else if (odd > 12) {
                // even_odd = 'odd'
                numberOfEvenOdd[5]++;

                rangeNoPrizesOfOdd13 = 0;
                rangeNoPrizesOfOdd11_12++;
                rangeNoPrizesOfDraw++;
                rangeNoPrizesOfEven11_12++;
                rangeNoPrizesOfEven13++;

                statusDone[5] = true
            }

            if (rangeNoPrizesOfEven13 > maxRangeNoPrizesOfEven13) {
                maxRangeNoPrizesOfEven13 = rangeNoPrizesOfEven13
            }
            if (rangeNoPrizesOfEven11_12 > maxRangeNoPrizesOfEven11_12) {
                maxRangeNoPrizesOfEven11_12 = rangeNoPrizesOfEven11_12;
            }
            if (rangeNoPrizesOfDraw > maxRangeNoPrizesOfDraw) {
                maxRangeNoPrizesOfDraw = rangeNoPrizesOfDraw;
            }
            if (rangeNoPrizesOfOdd11_12 > maxRangeNoPrizesOfOdd11_12) {
                maxRangeNoPrizesOfOdd11_12 = rangeNoPrizesOfOdd11_12;
            }
            if (rangeNoPrizesOfOdd13 > maxRangeNoPrizesOfOdd13) {
                maxRangeNoPrizesOfOdd13 = rangeNoPrizesOfOdd13;
            }

            if (!statusDone[1]) awardDistanceToPresent[1]++
            if (!statusDone[2]) awardDistanceToPresent[2]++
            if (!statusDone[3]) awardDistanceToPresent[3]++
            if (!statusDone[4]) awardDistanceToPresent[4]++
            if (!statusDone[5]) awardDistanceToPresent[5]++
        }

        averageFrequency[1] = numberOfEvenOdd[1] ? Math.floor(take * 100 / numberOfEvenOdd[1]) / 100 : '-';
        averageFrequency[2] = numberOfEvenOdd[2] ? Math.floor(take * 100 / numberOfEvenOdd[2]) / 100 : '-';
        averageFrequency[3] = numberOfEvenOdd[3] ? Math.floor(take * 100 / numberOfEvenOdd[3]) / 100 : '-';
        averageFrequency[4] = numberOfEvenOdd[4] ? Math.floor(take * 100 / numberOfEvenOdd[4]) / 100 : '-';
        averageFrequency[5] = numberOfEvenOdd[5] ? Math.floor(take * 100 / numberOfEvenOdd[5]) / 100 : '-';

        rangeNoPrizes[1] = maxRangeNoPrizesOfEven13;
        rangeNoPrizes[2] = maxRangeNoPrizesOfEven11_12;
        rangeNoPrizes[3] = maxRangeNoPrizesOfDraw;
        rangeNoPrizes[4] = maxRangeNoPrizesOfOdd11_12;
        rangeNoPrizes[5] = maxRangeNoPrizesOfOdd13;

        response.push(numberOfEvenOdd);
        response.push(averageFrequency);
        response.push(awardDistanceToPresent);
        response.push(rangeNoPrizes);


        // Get lastest results
        const kenoResults = await this.prismaService.resultKeno.findMany({
            where: { drawn: true },
            orderBy: { drawCode: 'desc' },
            take: take ? (parseInt(take.toString()) > 30 ? 30 : parseInt(take.toString())) : 10,
        })

        for (const element of kenoResults) {
            const result = element.result.split("-").map(Number)
            let even = 0, odd = 0;
            for (const number of result) {
                if (number % 2 == 0) even++; else odd++;
            }

            if (odd < 8) {
                // even_odd = 'even'
                response.push([element.drawTime, even, null, null, null, null])
            } else if (odd == 9 || odd == 8) {
                //  even_odd = 'even_11_12'
                response.push([element.drawTime, null, even, null, null, null])
            } else if (odd == 10) {
                //  even_odd = 'draw'
                response.push([element.drawTime, null, null, 10, null, null])
            } else if (odd == 11 || odd == 12) {
                // even_odd = 'odd_11_12'
                response.push([element.drawTime, null, null, null, odd, null])
            } else if (odd > 12) {
                // even_odd = 'odd'
                response.push([element.drawTime, null, null, null, null, odd])
            }
        }

        return response;
    }

    // Power Mega Statistical
    async statisticalPoMeNumber(type: LotteryType, start: Date, end: Date) {
        console.log(type, start, end)
        const statusDone = Array(60).fill(false, 1, 60)
        let list: ResultPower[] | ResultMega[] = []
        let res: any[] = []
        if (type == LotteryType.Mega) res = Array.from({ length: 46 }, (_, index) => [index, 0, '-', 0, 0, 0]);
        else res = Array.from({ length: 56 }, (_, index) => [index, 0, '-', 0, 0, 0]);

        if (type == LotteryType.Mega) {
            list = await this.prismaService.resultMega.findMany({
                where: {
                    drawn: true,
                    approved: true,
                    drawTime: { gte: new Date(start), lte: new Date(end) },
                },
                orderBy: { drawCode: 'desc' }
            })
        }
        else {
            list = await this.prismaService.resultPower.findMany({
                where: {
                    drawn: true,
                    approved: true,
                    drawTime: { gte: new Date(start), lte: new Date(end) }
                },
                orderBy: { drawCode: 'desc' }
            })
        }

        for (const element of list) {
            const numbers = element.result.split('-').map(Number)
            for (const number of numbers) {
                res[number][1]++
                res[number][4]++
                if (res[number][3] < element.drawCode) {
                    res[number][2] = '#' + element.drawCode.toString().padStart(5, "0") + ' - ' + formattedDate(element.drawTime)
                    res[number][3] = element.drawCode
                }

                statusDone[number] = true
            }

            if (type == LotteryType.Power) {
                //@ts-ignore
                const tmp = element.specialNumber
                res[tmp][1]++
                if (res[tmp][3] < element.drawCode) {
                    res[tmp][2] = '#' + element.drawCode.toString().padStart(5, "0") + ' - ' + formattedDate(element.drawTime)
                    res[tmp][3] = element.drawCode
                }

                statusDone[tmp] = true
            }

            for (let i = 1; i < res.length; i++) {
                if (statusDone[i] == false) res[i][5]++
            }
        }

        return {
            data: res.splice(1, res.length),
            start: list.length > 0 ? list[list.length - 1] : null,
            end: list.length > 0 ? list[0] : null
        }
    }

    async statisticalPoMeHeadtail(type: LotteryType, start: Date, end: Date) {
        let list: ResultPower[] | ResultMega[] = []
        const head = []
        const tail = []

        if (type == LotteryType.Mega) {
            list = await this.prismaService.resultMega.findMany({
                where: {
                    drawn: true,
                    approved: true,
                    drawTime: { gte: new Date(start), lte: new Date(end) },
                },
                orderBy: { drawCode: 'desc' }
            })
        }
        else {
            list = await this.prismaService.resultPower.findMany({
                where: {
                    drawn: true,
                    approved: true,
                    drawTime: { gte: new Date(start), lte: new Date(end) }
                },
                orderBy: { drawCode: 'desc' }
            })
        }

        for (const element of list) {
            const numbers = element.result.split('-').map(Number)
            const headArr = type == LotteryType.Power ? Array(6).fill(0) : Array(5).fill(0)
            const tailArr = Array(10).fill(0)

            for (const number of numbers) {
                const tmp1 = Math.floor(number / 10)
                const tmp2 = number % 10
                headArr[tmp1]++
                tailArr[tmp2]++
            }

            if (type == LotteryType.Power) {
                //@ts-ignore
                const tmp = element.specialNumber
                const tmp1 = Math.floor(tmp / 10)
                const tmp2 = tmp % 10
                headArr[tmp1]++
                tailArr[tmp2]++
            }

            const draw = '#' + element.drawCode.toString().padStart(5, "0") + ' - ' + formattedDate2(element.drawTime)
            head.push([...[draw], ...headArr])
            tail.push([...[draw], ...tailArr])
        }

        const haha = {
            head, tail,
            start: list.length > 0 ? list[list.length - 1] : null,
            end: list.length > 0 ? list[0] : null
        }
        return haha
    }

    async statisticalPoMeEvenOdd(type: LotteryType, start: Date, end: Date) {
        let list: ResultPower[] | ResultMega[] = []
        const data = []

        if (type == LotteryType.Mega) {
            list = await this.prismaService.resultMega.findMany({
                where: {
                    drawn: true,
                    approved: true,
                    drawTime: { gte: new Date(start), lte: new Date(end) },
                },
                orderBy: { drawCode: 'desc' }
            })
        }
        else {
            list = await this.prismaService.resultPower.findMany({
                where: {
                    drawn: true,
                    approved: true,
                    drawTime: { gte: new Date(start), lte: new Date(end) }
                },
                orderBy: { drawCode: 'desc' }
            })
        }

        for (const element of list) {
            const numbers = element.result.split('-').map(Number)

            let evenCount = 0;
            let oddCount = 0

            for (const number of numbers) {
                if (number % 2 == 0) evenCount++
                else oddCount++
            }

            if (type == LotteryType.Power) {
                //@ts-ignore
                const tmp = element.specialNumber
                if (tmp % 2 == 0) evenCount++
                else oddCount++
            }

            const draw = '#' + element.drawCode.toString().padStart(5, "0") + ' - ' + formattedDate(element.drawTime)
            data.push([draw, evenCount, oddCount])
        }

        const haha = {
            data,
            start: list.length > 0 ? list[list.length - 1] : null,
            end: list.length > 0 ? list[0] : null
        }
        return haha
    }

    async statisticalMax3dHeadtail(type: LotteryType, start: Date, end: Date) {
        let list: ResultMax3d[] = []
        const head = []
        const mid = []
        const tail = []

        list = await this.prismaService.resultMax3d.findMany({
            where: {
                drawn: true,
                approved: true,
                drawTime: { gte: new Date(start), lte: new Date(end) },
                type: type
            },
            orderBy: { drawCode: 'desc' }
        })

        for (const element of list) {

            const draw = '#' + element.drawCode.toString().padStart(5, "0") + ' - ' + formattedDate2(element.drawTime)
            let tmp = []
            tmp = [...element.special, ...element.first, ...element.second, ...element.third]
            tmp.map(Number)

            const headArr = Array(10).fill(0)
            const tailArr = Array(10).fill(0)
            const midArr = Array(10).fill(0)

            for (const number of tmp) {
                let hundred = 0;
                let dozen = 0;
                let unit = 0

                unit = number % 10
                dozen = Math.floor(number / 10) % 10
                hundred = Math.floor(number / 100)

                headArr[hundred]++;
                midArr[dozen]++;
                tailArr[unit]++;
            }

            head.push([...[draw], ...headArr])
            tail.push([...[draw], ...tailArr])
            mid.push([...[draw], ...midArr])
        }

        const haha = {
            head, mid, tail,
            start: list.length > 0 ? list[list.length - 1] : null,
            end: list.length > 0 ? list[0] : null
        }

        console.log(haha)
        return haha
    }
}
