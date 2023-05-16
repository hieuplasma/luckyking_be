export enum LotteryType {
    KenoBao = "kenobao",
    Keno = "keno",
    Mega = "mega645",
    Power = "power655",
    Max3D = "max3d",
    Max3DPlus = "max3dplus",
    Max3DPro = "max3dpro"
}

// export enum LotteryStatus {
//     PENDING = "pending",// chưa xử lý
//     CONFIRMED = "confirmed",//đã nhận tiền
//     ERROR = "error",//Lỗi hết bộ số hay 1 lý do nào đó
//     RETURNED = "returned",//đã trả lại,\
//     WON = "won", // ve thang
//     PAID = "paid", // da tra thuong
//     NO_PRIZE = "no_prize" // khong trung thuong
// }

export type SMALL_BIG = 'small' | 'big' | 'draw'
export type EVEN_ODD = 'even' | 'odd' | 'even_11_12' | 'odd_11_12' | 'draw'