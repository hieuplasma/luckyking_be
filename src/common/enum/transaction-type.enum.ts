export enum TransactionType {
    Recharge = "recharge",
    WithDraw = "withdraw",
    Rewarded = "rewarded",
    BuyLottery = "buylottery"
}

export enum TransactionDestination {
    LUCKY_KING = "Ví LuckyKing",
    REWARD = "Ví nhận thưởng",
    HOST = "Ví của nhà phát triển",
    BANK_ACOUNT = "Tài khoản của người dùng"
}

export enum TransactionStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FALSE = "false"
}