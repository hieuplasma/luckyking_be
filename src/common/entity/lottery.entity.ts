import { Prisma } from "@prisma/client"
import { convertArrayToJsonValue } from "../utils/other.utils"

export type INumberDetail = {
    boSo: string
    tienCuoc: number
}

export class NumberDetail {
    boSo: string = ""
    tienCuoc: number = 0
    constructor(boSo: string, tienCuoc: number) {
        this.boSo = boSo
        this.tienCuoc = tienCuoc
    }
}

export class LotteryNumber {
    list: NumberDetail[] = []
    constructor() {
        this.list = []
    }
    add(obj: NumberDetail) {
        this.list.push(obj)
    }
    convertToJSon() {
        // return JSON.stringify(this.list)
        return convertArrayToJsonValue(this.list)
    }
}