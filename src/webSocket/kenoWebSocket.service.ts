import { Injectable } from "@nestjs/common";
import { Lottery, User } from "@prisma/client";
import { Server, Socket } from 'socket.io';
import { nDate } from "src/common/utils";
import FirebaseApp from "src/firebase/firebase-app";
import { PrismaService } from "src/prisma/prisma.service";
import KenoQueueLottery from './kenoQueueLottery';


interface ISocketClient {
    socket: Socket
    isReady: boolean
}

@Injectable()
export class KenoSocketService {
    public server: Server = null;

    constructor(
        private prismaService: PrismaService,
        // private firebaseApp: FirebaseApp,
    ) { }


    private clients: ISocketClient[] = [];

    // onModuleInit() {
    //     this.startJob();
    // }

    // startJob() {
    //     setInterval(async () => {
    //         const now = new nDate()
    //         const schedule = await this.prismaService.resultKeno.findFirst({
    //             where: { drawn: false, drawTime: { gt: now } },
    //             orderBy: { drawCode: 'asc' },
    //         });

    //         console.log('Run interval...')

    //         const client = this.clients[0];
    //         if (!client) return;

    //         console.log('is ready: ', client.isReady);

    //         if (schedule && client.isReady) {
    //             const lottery = KenoQueueLottery.getLotteryByDrawCode(schedule.drawCode);

    //             if (!lottery) return;

    //             this.sendKenoLottery(lottery);
    //             // just send to one client
    //             client.isReady = false;
    //         }
    //     }, 3000);
    // }

    addNewClient(socket: Socket) {
        this.clients.push({
            socket,
            isReady: true,
        })
    };

    deleteClient(socket: Socket) {
        this.clients = this.clients.filter((client) => client.socket.id !== socket.id);
    }

    setClientReadyStatus() {
        const client = this.clients[0];

        if (!client) return;

        client.isReady = true;
    }

    sendMessage(user: User, message: any) {
        this.server.emit('newOrder', message);
    }

    sendKenoLottery(lottery: Lottery) {
        this.server.emit('newKenoLottery', lottery);
    }
}
