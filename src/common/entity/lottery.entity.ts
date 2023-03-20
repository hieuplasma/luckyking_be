export class NumberDetail {
    boSo: string = ""
    tienCuoc: string = "0"
    constructor(boSo: string, tienCuoc: string) {
        this.boSo = boSo
        this.tienCuoc = tienCuoc
    }
}

export class LotteryNumber {
    list: NumberDetail[] = []
    constructor() {
        this.list = []
    }
   async add(obj: NumberDetail) {
       this.list.push(obj)
    }
    convertToJSon() {
        return JSON.stringify(this.list)
    }
}