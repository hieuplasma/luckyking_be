export enum OrderMethod {
    Keep = "keep",
    Deliver = "deliver"
}

export enum OrderStatus {
    PENDING = "pending",// chưa xử lý
    PAID = "paid",//đã nhận tiền
    ERROR = "error",//Lỗi hết bộ số hay 1 lý do nào đó
    RETURNED = "returned",//đã trả lại
}

export enum RewardStatus {
    PENDING = "pending", //dang cho ket qua 
    PAID = "won", // da tra thuong
    NO_PRIZE = "no_prize" // khong trung thuong
}