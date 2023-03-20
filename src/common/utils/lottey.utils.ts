import { LotteryType } from "../enum";

export function caculateSurcharge(amount: number) {
    let surcharge = amount * 2 / 100;
    return surcharge;
}