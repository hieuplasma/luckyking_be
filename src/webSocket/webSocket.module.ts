import { Global, Module } from '@nestjs/common';
import { KenoSocketService } from './kenoWebSocket.service';
import { AppGateway } from './app.gateway'
import { JwtModule } from "@nestjs/jwt";
import { BasicLotterySocketService } from './basicLotteryWebSocket.service';

@Global()
@Module({
    imports: [JwtModule.register({})],
    providers: [AppGateway, KenoSocketService, BasicLotterySocketService],
    exports: [KenoSocketService, BasicLotterySocketService],
})
export class WebSocketModule { }
