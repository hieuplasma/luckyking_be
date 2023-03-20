export enum LotteryType {
    KenoBao = "kenobao",
    Keno = "keno",
    Mega = "mega645",
    Power = "power655",
    Max3D = "max3d",
    Max3DPlus = "max3dplus",
    Max3DPro = "max3dpro"
}

export enum LotteryStatus {
    PENDING = "pending", // dang cho ket qua
    WON = "won", // Ve da trung
    FAILED = "failed", // Ve da truot
    CANCELLED = "cancelled" // Ve da huy
}