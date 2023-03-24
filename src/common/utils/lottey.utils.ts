import { Lottery } from '../../../node_modules/.prisma/client';
import { NumberDetail } from '../entity';
import { LotteryType } from "../enum";

export function caculateSurcharge(amount: number) {
    let surcharge = amount * 2 / 100;
    return surcharge;
}

const MUOI_NGHIN = 10000
const TRIEU = 1000000
const TY = 1000000000

export function caculateKenoBenefits(lottery: any, resultString: string) {
    const result: number[] = resultString.split("-").map(Number)
    let totalBenefits = 0;
    const numberDetail: NumberDetail[] = JSON.parse(lottery.NumberLottery.numberDetail.toString())
    const level = lottery.NumberLottery.level
    numberDetail.map(item => {
        let benefits = 0
        const numbers: number[] = item.boSo.split("-").map(Number);
        let duplicate = 0;
        numbers.map(number => {
            if (result.includes(number)) duplicate++
        })
        switch (level) {
            case 1:
                if (duplicate == 1) benefits = benefits + 2 * MUOI_NGHIN
                break;
            case 2:
                if (duplicate == 2) benefits = benefits + 9 * MUOI_NGHIN
                break;
            case 3:
                if (duplicate == 3) benefits = benefits + 20 * MUOI_NGHIN
                if (duplicate == 2) benefits = benefits + 2 * MUOI_NGHIN
                break;
            case 4:
                if (duplicate == 4) benefits = benefits + 40 * MUOI_NGHIN
                if (duplicate == 3) benefits = benefits + 5 * MUOI_NGHIN
                if (duplicate == 2) benefits = benefits + MUOI_NGHIN
                break
            case 5:
                if (duplicate == 5) benefits = benefits + 4 * TRIEU + 40 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 15 * MUOI_NGHIN
                if (duplicate == 3) benefits = benefits + MUOI_NGHIN
                break;
            case 6:
                if (duplicate == 6) benefits = benefits + 12 * TRIEU + 50 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 45 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 4 * MUOI_NGHIN
                if (duplicate == 3) benefits = benefits + MUOI_NGHIN
                break;
            case 7:
                if (duplicate == 7) benefits = benefits + 40 * TRIEU
                if (duplicate == 6) benefits = benefits + TRIEU + 20 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 10 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 2 * MUOI_NGHIN
                if (duplicate == 3) benefits = benefits + MUOI_NGHIN
                break;
            case 8:
                if (duplicate == 8) benefits = benefits + 200 * TRIEU
                if (duplicate == 7) benefits = benefits + 5 * TRIEU
                if (duplicate == 6) benefits = benefits + 50 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 5 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + MUOI_NGHIN
            case 9:
                if (duplicate == 9) benefits = benefits + 800 * TRIEU
                if (duplicate == 8) benefits = benefits + 12 * TRIEU
                if (duplicate == 7) benefits = benefits + TRIEU + 50 * MUOI_NGHIN
                if (duplicate == 6) benefits = benefits + 5 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 3 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + MUOI_NGHIN
                if (duplicate == 0) benefits = benefits + MUOI_NGHIN
            case 10:
                if (duplicate == 9) benefits = benefits + 2 * TY
                if (duplicate == 8) benefits = benefits + 150 * TRIEU
                if (duplicate == 7) benefits = benefits + 8 * TRIEU
                if (duplicate == 6) benefits = benefits + 71 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 8 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 2 * MUOI_NGHIN
                if (duplicate == 0) benefits = benefits + MUOI_NGHIN
            default:
                break;
        }
        let tmp = Math.floor(parseInt(item.tienCuoc.toString()) / 10000) * benefits
        totalBenefits = totalBenefits + tmp
    })
    return totalBenefits
}

export function caculateMegaBenefits(lottery: any, resultString: string, jackPot: number) {
    const result: number[] = resultString.split("-").map(Number)
    let totalBenefits = 0;
    const numberDetail: NumberDetail[] = JSON.parse(lottery.NumberLottery.numberDetail.toString())
    const level = lottery.NumberLottery.level
    numberDetail.map(item => {
        let benefits = 0
        const numbers: number[] = item.boSo.split("-").map(Number);
        let duplicate = 0;
        numbers.map(number => {
            if (result.includes(number)) duplicate++
        })
        switch (level) {
            case 5:
                if (duplicate == 2) benefits = benefits + 12 * MUOI_NGHIN
                if (duplicate == 3) benefits = benefits + 2 * TRIEU + MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 21 * TRIEU + 4 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + jackPot + 390 * TRIEU
                break;
            case 6:
                if (duplicate == 3) benefits = benefits + 3 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 30 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 10 * TRIEU
                if (duplicate == 6) benefits = benefits + jackPot
                break;
            case 7:
                if (duplicate == 3) benefits = benefits + 12 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + TRIEU + 3 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 21 * TRIEU + 50 * MUOI_NGHIN
                if (duplicate == 6) benefits = benefits + jackPot + 60 * TRIEU
                break;
            case 8:
                if (duplicate == 3) benefits = benefits + 30 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 2 * TRIEU + 28 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 34 * TRIEU + 80 * MUOI_NGHIN
                if (duplicate == 6) benefits = benefits + jackPot + 124 * TRIEU + 50 * MUOI_NGHIN
                break
            case 9:
                if (duplicate == 3) benefits = benefits + 60 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 4 * TRIEU + 20 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 50 * TRIEU + 20 * MUOI_NGHIN
                if (duplicate == 6) benefits = benefits + jackPot + 194 * TRIEU + 10 * MUOI_NGHIN
                break;
            case 10:
                if (duplicate == 3) benefits = benefits + TRIEU + 5 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 6 * TRIEU + 90 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 68 * TRIEU
                if (duplicate == 6) benefits = benefits + jackPot + 269 * TRIEU + 40 * MUOI_NGHIN
                break;
            case 11:
                if (duplicate == 3) benefits = benefits + TRIEU + 68 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 10 * TRIEU + 50 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 88 * TRIEU + 50 * MUOI_NGHIN
                if (duplicate == 6) benefits = benefits + jackPot + 351 * TRIEU
                break;
            case 12:
                if (duplicate == 3) benefits = benefits + 2 * TRIEU + 52 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 15 * TRIEU + 12 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 112 * TRIEU
                if (duplicate == 6) benefits = benefits + jackPot + 439 * TRIEU + 50 * MUOI_NGHIN
            case 13:
                if (duplicate == 3) benefits = benefits + 3 * TRIEU + 60 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 20 * TRIEU + 88 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 138 * TRIEU + 80 * MUOI_NGHIN
                if (duplicate == 6) benefits = benefits + jackPot + 535 * TRIEU + 50 * MUOI_NGHIN
            case 14:
                if (duplicate == 3) benefits = benefits + 4 * TRIEU + 95 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 27 * TRIEU + 90 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 169 * TRIEU + 20 * MUOI_NGHIN
                if (duplicate == 6) benefits = benefits + jackPot + 639 * TRIEU + 60 * MUOI_NGHIN
            case 15:
                if (duplicate == 3) benefits = benefits + 6 * TRIEU + 60 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 36 * TRIEU + 30 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 203 * TRIEU + 50 * MUOI_NGHIN
                if (duplicate == 6) benefits = benefits + jackPot + 752 * TRIEU + 40 * MUOI_NGHIN
            case 18:
                if (duplicate == 3) benefits = benefits + 13 * TRIEU + 65 * MUOI_NGHIN
                if (duplicate == 4) benefits = benefits + 70 * TRIEU + 98 * MUOI_NGHIN
                if (duplicate == 5) benefits = benefits + 332 * TRIEU + 80 * MUOI_NGHIN
                if (duplicate == 6) benefits = benefits + jackPot + 11449 * TRIEU
            default:
                break;
        }
        // let tmp = Math.floor(parseInt(item.tienCuoc.toString()) / 10000) * benefits
        totalBenefits = totalBenefits + benefits
    })
    return totalBenefits
}

export function caculatePowerBenefits(lottery: any, resultString: string, specialNumber: number) {
    return 0
}

export function serializeBigInt(obj: any) {
    const returned = JSON.stringify(
        obj,
        (key, value) => (typeof value === 'bigint' ? value.toString() : value)
    )
    return returned
}