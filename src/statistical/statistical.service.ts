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

    async statisticalKenoBigSmall(take: number = 10) {
        const list = await this.prismaService.resultKeno.findMany({
            where: { drawn: true },
            orderBy: { drawCode: 'desc' },
            take: take,
        })

        const response = [];
        const numberOfBigSmall = Array(4).fill(0, 1, 4);
        const averageFrequency = Array(4).fill(0, 1, 4);
        const rangeNoPrizes = Array(4).fill(0, 1, 4);
        const awardDistanceToPresent = Array(4).fill(0, 1, 4);

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

                if (rangeNoPrizesOfBig > maxRangeNoPrizesOfBig) {
                    maxRangeNoPrizesOfBig = rangeNoPrizesOfBig;
                }

                rangeNoPrizesOfBig = 0;
                rangeNoPrizesOfDraw++;
                rangeNoPrizesOfSmall++;
            } else if (big === 10) {
                numberOfBigSmall[2]++;

                if (rangeNoPrizesOfDraw > maxRangeNoPrizesOfDraw) {
                    maxRangeNoPrizesOfDraw = rangeNoPrizesOfDraw;
                }

                rangeNoPrizesOfDraw = 0;
                rangeNoPrizesOfBig++;
                rangeNoPrizesOfSmall++;
            } else if (big < 10) {
                numberOfBigSmall[3]++;

                if (rangeNoPrizesOfSmall > maxRangeNoPrizesOfSmall) {
                    maxRangeNoPrizesOfSmall = rangeNoPrizesOfSmall;
                }

                rangeNoPrizesOfSmall = 0;
                rangeNoPrizesOfBig++;
                rangeNoPrizesOfDraw++;
            }
        }

        averageFrequency[1] = take / numberOfBigSmall[1];
        averageFrequency[2] = take / numberOfBigSmall[2];
        averageFrequency[3] = take / numberOfBigSmall[3];

        awardDistanceToPresent[1] = rangeNoPrizesOfBig;
        awardDistanceToPresent[2] = rangeNoPrizesOfDraw;
        awardDistanceToPresent[3] = rangeNoPrizesOfSmall;

        rangeNoPrizes[1] = maxRangeNoPrizesOfBig;
        rangeNoPrizes[2] = maxRangeNoPrizesOfDraw;
        rangeNoPrizes[3] = maxRangeNoPrizesOfSmall;

        response.push(numberOfBigSmall);
        response.push(averageFrequency);
        response.push(awardDistanceToPresent);
        response.push(rangeNoPrizes);


        // Get 10 lastest results
        const kenoResults = await this.prismaService.resultKeno.findMany({
            where: { drawn: true },
            orderBy: { drawCode: 'desc' },
            take: 10,
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
            take: take,
        })

        const response = [];
        const numberOfEvenOdd = Array(6).fill(0, 1, 6);
        const averageFrequency = Array(6).fill(0, 1, 6);
        const rangeNoPrizes = Array(6).fill(0, 1, 6);
        const awardDistanceToPresent = Array(4).fill(0, 1, 6);

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
                if (rangeNoPrizesOfEven13 > maxRangeNoPrizesOfEven13) {
                    maxRangeNoPrizesOfEven13 = rangeNoPrizesOfEven13
                }
                rangeNoPrizesOfEven13 = 0;
                rangeNoPrizesOfEven11_12++;
                rangeNoPrizesOfDraw++;
                rangeNoPrizesOfOdd11_12++;
                rangeNoPrizesOfOdd13++;
            } else if (odd === 9 || odd === 8) {
                // even_odd = 'even_11_12'
                numberOfEvenOdd[2]++;
                if (rangeNoPrizesOfEven11_12 > maxRangeNoPrizesOfEven11_12) {
                    maxRangeNoPrizesOfEven11_12 = rangeNoPrizesOfEven11_12;
                }
                rangeNoPrizesOfEven11_12 = 0;
                rangeNoPrizesOfEven13++;
                rangeNoPrizesOfDraw++;
                rangeNoPrizesOfOdd11_12++;
                rangeNoPrizesOfOdd13++;
            } else if (odd === 10) {
                // even_odd = 'draw'
                numberOfEvenOdd[3]++;
                if (rangeNoPrizesOfDraw > maxRangeNoPrizesOfDraw) {
                    maxRangeNoPrizesOfDraw = rangeNoPrizesOfDraw;
                }
                rangeNoPrizesOfEven11_12++;
                rangeNoPrizesOfEven13++;
                rangeNoPrizesOfDraw = 0;
                rangeNoPrizesOfOdd11_12++;
                rangeNoPrizesOfOdd13++;
            } else if (odd === 11 || odd === 12) {
                //  even_odd = 'odd_11_12'
                numberOfEvenOdd[4]++;
                if (rangeNoPrizesOfOdd11_12 > maxRangeNoPrizesOfOdd11_12) {
                    maxRangeNoPrizesOfOdd11_12 = rangeNoPrizesOfOdd11_12;
                }
                rangeNoPrizesOfEven11_12++;
                rangeNoPrizesOfEven13++;
                rangeNoPrizesOfDraw++;
                rangeNoPrizesOfOdd11_12 = 0;
                rangeNoPrizesOfOdd13++;
            } else if (odd > 12) {
                // even_odd = 'odd'
                numberOfEvenOdd[5]++;
                if (rangeNoPrizesOfOdd13 > maxRangeNoPrizesOfOdd13) {
                    maxRangeNoPrizesOfOdd13 = rangeNoPrizesOfOdd13;
                }
                rangeNoPrizesOfOdd13 = 0;
                rangeNoPrizesOfOdd11_12++;
                rangeNoPrizesOfDraw++;
                rangeNoPrizesOfEven11_12++;
                rangeNoPrizesOfEven13++;
            }


        }

        averageFrequency[1] = take / numberOfEvenOdd[1];
        averageFrequency[2] = take / numberOfEvenOdd[2];
        averageFrequency[3] = take / numberOfEvenOdd[3];
        averageFrequency[4] = take / numberOfEvenOdd[4];
        averageFrequency[5] = take / numberOfEvenOdd[5];

        awardDistanceToPresent[1] = rangeNoPrizesOfEven13;
        awardDistanceToPresent[2] = rangeNoPrizesOfEven11_12;
        awardDistanceToPresent[3] = rangeNoPrizesOfDraw;
        awardDistanceToPresent[4] = rangeNoPrizesOfOdd11_12;
        awardDistanceToPresent[5] = rangeNoPrizesOfOdd13;

        rangeNoPrizes[1] = maxRangeNoPrizesOfEven13;
        rangeNoPrizes[2] = maxRangeNoPrizesOfEven11_12;
        rangeNoPrizes[3] = maxRangeNoPrizesOfDraw;
        rangeNoPrizes[4] = maxRangeNoPrizesOfOdd11_12;
        rangeNoPrizes[5] = maxRangeNoPrizesOfOdd13;

        response.push(numberOfEvenOdd);
        response.push(averageFrequency);
        response.push(awardDistanceToPresent);
        response.push(rangeNoPrizes);


        // Get 10 lastest results
        const kenoResults = await this.prismaService.resultKeno.findMany({
            where: { drawn: true },
            orderBy: { drawCode: 'desc' },
            take: 10,
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
}
