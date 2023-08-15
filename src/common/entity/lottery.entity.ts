import { Prisma } from "@prisma/client"
import { convertArrayToJsonValue } from "../utils/other.utils"

export type INumberDetail = {
    boSo: string
    tienCuoc: number,
    tuChon: boolean | undefined
}

export class NumberDetail {
    boSo: string = ""
    tienCuoc: number = 0
    tuChon: boolean | undefined = false
    constructor(boSo: string, tienCuoc: number, tuChon: boolean = false) {
        this.boSo = boSo
        this.tienCuoc = tienCuoc
        this.tuChon = tuChon
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