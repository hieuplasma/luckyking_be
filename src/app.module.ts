import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LotteryModule } from './lottery/lottery.module';
import { TransactionModule } from './transaction/transaction.module';
import { OrderModule } from './order/order.module';
import { ResultModule } from './result/result.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    PrismaModule,
    LotteryModule,
    TransactionModule,
    OrderModule,
    ResultModule
  ],
})
export class AppModule { }
