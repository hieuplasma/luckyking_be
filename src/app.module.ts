import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { LotteryModule } from './lottery/lottery.module';
import { TransactionModule } from './transaction/transaction.module';
import { OrderModule } from './order/order.module';
import { ResultModule } from './result/result.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CartModule } from './cart/cart.module';
import { PreAuthMiddleware } from './firebase/PreAuthMiddleware';
import FirebaseApp from './firebase/firebase-app';
import { join } from 'path';
import { WebSocketModule } from './webSocket/webSocket.module';
import { FirebaseModule } from './firebase/firebase.module';
import { DeviceModule } from './device/device.module';
import { StatisticalModule } from './statistical/statistical.module';
import { SystemModule } from './system/system.module';
import { OtpMiddleware } from './otp/otp.middleware';
import { OtpModule } from './otp/otp.module';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads/images'),
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    AuthModule,
    UserModule,
    DeviceModule,
    PrismaModule,
    LotteryModule,
    TransactionModule,
    OrderModule,
    ResultModule,
    CartModule,
    WebSocketModule,
    FirebaseModule,
    StatisticalModule,
    SystemModule,
    OtpModule
  ],
  providers: [JwtService]
  // providers: [FirebaseApp]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer): any {
    consumer.apply(PreAuthMiddleware).forRoutes({
      path: '/auth/sercure/*',
      method: RequestMethod.ALL,
    });
    consumer.apply(OtpMiddleware).forRoutes({
      path: '/auth/otp-verified/*',
      method: RequestMethod.ALL,
    });
  }
}
