import { Global, Module } from '@nestjs/common';
import { KenoSocketService } from './kenoWebSocket.service';
import { AppGateway } from './app.gateway'
import { JwtModule } from "@nestjs/jwt";

@Global()
@Module({
    imports: [JwtModule.register({})],
    providers: [AppGateway, KenoSocketService],
    exports: [KenoSocketService],
})
export class WebSocketModule { }
