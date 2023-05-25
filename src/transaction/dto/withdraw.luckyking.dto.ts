import { IsNotEmpty } from "class-validator";
import { TransactionStatus } from "src/common/enum";

export class WithDrawLuckyKingDTO {
    @IsNotEmpty()
    amount: number
}

export class WithDrawBankAccountDTO {

    @IsNotEmpty() amount: number
    name: string
    @IsNotEmpty() shortName: string
    @IsNotEmpty() accountNumber: string
    code: string

    status: TransactionStatus
    save: Boolean
    userName: string
    logo: string
}

export class AcceptBankWithdrawDTO {
    @IsNotEmpty() id: string
    @IsNotEmpty() status: TransactionStatus
    statusDescription: string
}