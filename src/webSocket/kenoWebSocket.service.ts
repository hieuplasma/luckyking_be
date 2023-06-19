import { Injectable } from "@nestjs/common";
import { Lottery, User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { serializeBigInt } from "src/common/utils";
import { PrismaService } from "src/prisma/prisma.service";


interface ISocketClient {
    socket: Socket
    isReady: boolean
}

@Injectable()
export class KenoSocketService {
    public server: Server = null;

    constructor(
        private prismaService: PrismaService,
    ) { }


    private clients: ISocketClient[] = [];

    addNewClient(socket: Socket) {
        this.clients.push({
            socket,
            isReady: true,
        })
    };

    deleteClient(socket: Socket) {
        this.clients = this.clients.filter((client) => client.socket.id !== socket.id);
    }

    sendMessage(message: any) {
        this.server.emit('message', message);
    }

    sendKenoLottery(lotteries: Lottery[]) {
        this.server.emit('NewKenoLottery', { lotteries: serializeBigInt(lotteries) });
    }
}
