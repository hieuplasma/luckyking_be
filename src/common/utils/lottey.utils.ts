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
        console.log(numbers)
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
    console.log(totalBenefits)
    return totalBenefits
}

export function caculateMegaBenefits(lottery: any, result: string) {
    return 0
}

export function caculatePowerBenefits(lottery: any, result: string) {
    return 0
}