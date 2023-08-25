import { Injectable } from '@nestjs/common';
import { Order, User } from '@prisma/client';
import { Server, Socket } from 'socket.io';
import { serializeBigInt } from 'src/common/utils';
import { PrismaService } from 'src/prisma/prisma.service';
import { socketEvent } from './socket.event';

interface ISocketClient {
  socketId: string;
  userId: string;
}

@Injectable()
export class BasicLotterySocketService {
  public server: Server = null;

  constructor(private prismaService: PrismaService) {}

  private clients: ISocketClient[] = [];

  addNewClient(socket: Socket, userId: string) {
    this.clients.push({
      socketId: socket.id,
      userId,
    });
  }

  deleteClient(socket: Socket) {
    this.clients = this.clients.filter(
      (client) => client.socketId !== socket.id,
    );
  }

  async sendOrderToStaff(
    order: Order & {
      Lottery?: any[];
    },
  ) {
    if (this.clients.length === 0) return;

    const staffMemberToSend = this.clients[0];
    if (!staffMemberToSend) return;

    const config = await this.prismaService.config.findFirst({});
    const { stopDistributingBasicTickets } = config;

    if (stopDistributingBasicTickets) {
      return;
  }

    for (const lottery of order.Lottery) {
      if (!lottery.assignedStaffId) {
        await this.prismaService.lottery.update({
          where: { id: lottery.id },
          data: { assignedStaffId: staffMemberToSend.userId },
        });
      }
    }

    // Check max lock order here.....

    const { socketId } = staffMemberToSend;

    this.server.to(socketId).emit(socketEvent.newOrder, {
      order: serializeBigInt(order),
    });

    if (this.clients.length > 1) {
      const client = this.clients.shift();
      this.clients.push(client);
    }
  }
}
