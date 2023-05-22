import { Logger } from '@nestjs/common';
import {
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnGatewayInit,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { KenoSocketService } from './kenoWebSocket.service'
import { Socket } from 'socket.io';



@WebSocketGateway(parseInt(process.env.SOCKET_PORT), { cors: true })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(private kenoSocketService: KenoSocketService) { }

    private logger: Logger = new Logger('AppGateWay');

    afterInit(server: any) {
        this.kenoSocketService.server = server;
        this.logger.log('Initialized!');
    }

    @SubscribeMessage('getNextKenoOrder')
    async getNextKenoOrder(
        @MessageBody() data: string,
        @ConnectedSocket() client: Socket,
    ) {

        console.log(data)
        return false;
    }

    @SubscribeMessage('readyToGetKeno')
    async readyToGetKeno(
        @MessageBody() data: string,
        @ConnectedSocket() client: Socket,
    ) {

        this.kenoSocketService.setClientReadyStatus();
        return false;
    }

    async handleConnection(client: Socket) {
        console.log('connection: ')
        console.log(client.id)
        this.kenoSocketService.addNewClient(client);
    }

    async handleDisconnect(client: Socket) {
        console.log('disconnect')
        this.kenoSocketService.deleteClient(client)
    }
}