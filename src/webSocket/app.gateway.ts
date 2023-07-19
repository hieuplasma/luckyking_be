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
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from "@nestjs/config";
import { socketEvent } from './socket.event';


@WebSocketGateway(parseInt(process.env.SOCKET_PORT), { cors: true })
export class AppGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private configService: ConfigService,
        private kenoSocketService: KenoSocketService,
        private jwtService: JwtService,
    ) { }

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

    @SubscribeMessage(socketEvent.IAmBusy)
    async setEmployeeIsBusy(
        @MessageBody() data: string,
        @ConnectedSocket() client: Socket,
    ) {
        this.kenoSocketService.setEmployeeIsBusy(client);
        return false;
    }

    @SubscribeMessage(socketEvent.IAmReady)
    async setEmployeeIsReady(
        @MessageBody() data: string,
        @ConnectedSocket() client: Socket,
    ) {
        this.kenoSocketService.setEmployeeIsReady(client);
        return false;
    }

    async handleConnection(client: Socket) {
        console.log('connection: ', client.id);
        try {

            if (!client.handshake.headers.authorization) {
                console.log('UnAuthorization')
                return
            };

            const token = client.handshake.headers.authorization.split(' ')[1];

            if (!token) {
                console.log('Token not exists');
                return;
            }

            const data = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get('JWT_SECRET'),
                ignoreExpiration: true
            })

            this.kenoSocketService.addNewClient(client, data.sub);
        } catch (error) {
            console.log(error)
        }
    }

    async handleDisconnect(client: Socket) {
        console.log('disconnect: ', client.id)
        this.kenoSocketService.deleteClient(client)
    }
}