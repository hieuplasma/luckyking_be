import { Logger } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { KenoSocketService } from './kenoWebSocket.service';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { socketEvent } from './socket.event';
import { TicketOrderType } from 'src/common/enum';
import { BasicLotterySocketService } from './basicLotteryWebSocket.service';

@WebSocketGateway(parseInt(process.env.SOCKET_PORT), {
  cors: true,
  pingInterval: 2100,
  pingTimeout: 2000,
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(
    private configService: ConfigService,
    private kenoSocketService: KenoSocketService,
    private basicLotterySocketService: BasicLotterySocketService,
    private jwtService: JwtService,
  ) {}

  private logger: Logger = new Logger('AppGateWay');

  afterInit(server: any) {
    this.kenoSocketService.server = server;
    this.basicLotterySocketService.server = server;
    this.logger.log('Initialized!');
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
    try {
      if (!client.handshake.auth.token) {
        console.log('UnAuthorization');
        return;
      }

      const token = client.handshake.auth.token.split(' ')[1];

      if (!token) {
        console.log('Token not exists');
        return;
      }

      const data = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get('JWT_SECRET'),
        ignoreExpiration: true,
      });

      const { type } = client.handshake.query;
      console.log(`connection ${type}:`, client.id);

      if (type === TicketOrderType.Keno) {
        this.kenoSocketService.addNewClient(client, data.sub);
      } else if (type === TicketOrderType.Basic) {
        this.basicLotterySocketService.addNewClient(client, data.sub);
      }
    } catch (error) {
      console.log(error);
    }
  }

  async handleDisconnect(client: Socket) {
    const { type } = client.handshake.query;
    console.log(`disconnect ${type}:`, client.id);

    if (type === TicketOrderType.Keno) {
      this.kenoSocketService.deleteClient(client);
    } else if (type === TicketOrderType.Basic) {
      this.basicLotterySocketService.deleteClient(client);
    }
  }
}
