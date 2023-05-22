import { Global, Module } from '@nestjs/common';
import { KenoSocketService } from './kenoWebSocket.service';
import { AppGateway } from './app.gateway'
// import { FirebaseModule } from 'src/firebase/firebase.module';

@Global()
@Module({
    // imports: [FirebaseModule],
    providers: [AppGateway, KenoSocketService],
    exports: [KenoSocketService],
})
export class WebSocketModule { }
