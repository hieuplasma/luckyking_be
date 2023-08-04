import { Prisma } from "@prisma/client"
import { EVEN_ODD, SMALL_BIG } from "../enum"
import { serialize } from "class-transformer"
import { serializeBigInt } from "./lottey.utils"

export const mapDataFromScanner = {
    '11': '81', // Lớn
    '12': '82', // Nhỏ
    '13': '84', // Chẵn 13+
    '14': '86', // Lẻ 13+
    '15': '83', // Hoà lớn nhỏ =================chưa kiểm định
    '16': '85', // Hoà (chẵn lẻ)
    '17': '87', // Chẵn (11-12)
    '18': '88' // Lẻ (11-12)  ==================chưa kiểm định
}

export function getLevelFromNumber(param: number, oldLevel: number) {
    const number = parseInt(param.toString())
    switch (number) {
        case 81: return 11
        case 82: return 12
        case 84: return 13
        case 86: return 14
        case 83: return 15
        case 85: return 16
        case 87: return 17
        case 88: return 18
        default: return oldLevel
    }
}

export function kenoAnalysis(param: number[]) {
    let small = 0, big = 0, even = 0, odd = 0, small_big: SMALL_BIG = 'small', even_odd: EVEN_ODD = 'even'
    for (const element of param) {
        if (element <= 40) small++; else big++;
        if (element % 2 == 0) even++; else odd++;
    }

    let event_number: number[] = []

    if (big > 10) small_big = 'big'
    if (big == 10) small_big = 'draw'
    if (big < 10) small_big = 'small'

    if (odd > 12) even_odd = 'odd'
    if (odd == 11 || odd == 12) even_odd = 'odd_11_12'
    if (odd == 10) even_odd = 'draw'
    if (odd == 9 || odd == 8) even_odd = 'even_11_12'
    if (odd < 8) even_odd = 'even'

    switch (small_big) {
        case 'big':
            event_number.push(81)
            break;
        case 'small':
            event_number.push(82)
            break;
        case 'draw':
            event_number.push(83)
            break;
        default:
            break;
    }

    switch (even_odd) {
        case 'even':
            event_number.push(84)
            break;
        case 'draw':
            event_number.push(85)
            break;
        case 'odd':
            event_number.push(86)
            break;
        case 'even_11_12':
            event_number.push(87)
            break;
        case 'odd_11_12':
            event_number.push(88)
            break;
        default:
            break;
    }

    return { small, big, even, odd, small_big, even_odd, event_number }
}

export function convertObjectToJsonValue(obj: object): Prisma.JsonValue {
    const jsonString = JSON.stringify(serializeBigInt(obj));
    const jsonValue = JSON.parse(jsonString) as Prisma.JsonValue;
    // console.log("jsonValue", jsonValue)
    return jsonValue;
}

export function convertArrayToJsonValue(array: object[]): Prisma.JsonValue {
    const jsonString = JSON.stringify(serializeBigInt(array));
    const jsonValue = JSON.parse(jsonString) as Prisma.JsonValue;
    return jsonValue;
}

export function printCode(param: any) {
    const code = parseInt(param.toString())
    return "#" + code.toString().padStart(7, "0")
}

export function printDrawCode(param: any) {
    const code = parseInt(param.toString())
    return "#" + code.toString().padStart(7, "0")
}

export function printNumber(param: any) {
    return param.toString().padStart(2, "0")
}