import { Global, Module } from '@nestjs/common';
import { KenoSocketService } from './kenoWebSocket.service';
import { AppGateway } from './app.gateway'

@Global()
@Module({
    providers: [AppGateway, KenoSocketService],
    exports: [KenoSocketService],
})
export class WebSocketModule { }
