import { Injectable } from "@nestjs/common";
import { Lottery, OrderStatus, User } from "@prisma/client";
import dayjs from "dayjs";
import { Server, Socket } from 'socket.io';
import { serializeBigInt } from "src/common/utils";
import { PrismaService } from "src/prisma/prisma.service";
import { socketEvent } from "./socket.event";

interface ISocketClient {
    socketId: string
    userId: string
    isReady: boolean
}

interface ISocketLottery {
    id: string,
    type: string,
    buyTime: Date,
    status: OrderStatus,
    orderId: string,
    userId: string,
    amount: string | number,
    bets: any,
    displayId: string | number,
    drawCode: string | number,
    drawTime: Date,
    assignedStaffId: string
    Order: any,
    NumberLottery: any,
}

@Injectable()
export class KenoSocketService {
    public server: Server = null;

    constructor(
        private prismaService: PrismaService,
    ) { }

    private clients: ISocketClient[] = [];
    private pendingLotteries: ISocketLottery[] = [];

    addNewClient(socket: Socket, userId: string) {
        const existUser = this.clients.find(client => client.userId === userId);
        if (existUser) {
            existUser.socketId = socket.id;
            existUser.isReady = true;
        } else {
            this.clients.push({
                socketId: socket.id,
                userId,
                isReady: true,
            })
        }
    };

    setEmployeeIsBusy(client: Socket) {
        const staffMember = this.clients.find(member => member.socketId === client.id);
        staffMember.isReady = false;
    }

    setEmployeeIsReady(client: Socket) {
        const staffMember = this.clients.find(member => member.socketId === client.id);
        if (!staffMember) return;

        staffMember.isReady = true;

        this.revokeAllKenoFromUser(staffMember.userId)
    }

    async deleteClient(socket: Socket) {
        const client = this.clients.find((client) => client.socketId === socket.id);
        this.clients = this.clients.filter((client) => client.socketId !== socket.id);

        if (client) {
            this.revokeAllKenoFromUser(client.userId);
        }
    }

    revokeAllKenoFromUser(userId: string) {
        this.pendingLotteries = this.pendingLotteries.map(lottery => {
            if (lottery.assignedStaffId === userId) {
                lottery.assignedStaffId = null;
                if (lottery.status === OrderStatus.LOCK) {
                    lottery.status = OrderStatus.PENDING;
                }
            }

            return lottery;
        })

        this.sendKenoToStaff();
    }

    sendMessage(message: any) {
        this.server.emit('message', message);
    }

    sendKenoLottery(lotteries: Lottery[]) {
        this.server.emit('NewKenoLottery', { lotteries: serializeBigInt(lotteries) });
    }

    printLottery(lotteryId: string) {
        const lottery = this.pendingLotteries.find(lottery => lottery.id === lotteryId);
        if (lottery) {
            lottery.status = OrderStatus.PRINTED;
        }
    }

    confirmLottery(lotteryId: string) {
        this.pendingLotteries = this.pendingLotteries.filter(lottery => lottery.id !== lotteryId);
    }

    resetLotteriesQueue() {
        this.pendingLotteries = [];
    }

    pushLotteriesToQueue(lotteries: ISocketLottery[]) {
        this.pendingLotteries.push(...lotteries);
        this.sendKenoToStaff();
    }

    async sendKenoToStaff() {
        if (this.clients.length === 0) return;
        const returnedLotteryIds = [];
        let config = null;
        
        for (const lottery of this.pendingLotteries) {
            if (lottery.assignedStaffId !== null) continue;

            if (!config) {
                config = await this.prismaService.config.findFirst({});
            }

            const {kenoDuration, kenoPauseTime} = config;

            if (dayjs(lottery.drawTime).diff(dayjs()) / 1000 <= kenoPauseTime) {
                return;
            }

            const staffMemberToSend = this.clients.find((member) => member.isReady === true);
            if (!staffMemberToSend) return;

            const lotteryToSend = await this.prismaService.lottery.findUnique({
                where: {
                    id: lottery.id,
                },
            })

            if (!lotteryToSend || lotteryToSend.status === OrderStatus.RETURNED) {
                returnedLotteryIds.push(lottery.id);
                continue;
            }

            const { socketId } = staffMemberToSend;

            this.server.to(socketId).emit(socketEvent.NewKenoLottery, { lotteries: serializeBigInt([lottery]), kenoDuration });
            staffMemberToSend.isReady = false;

            if (this.clients.length > 1) {
                const client = this.clients.shift();
                this.clients.push(client);
            }

            if (lottery.status === OrderStatus.PENDING) {
                lottery.status = OrderStatus.LOCK;
            }
            lottery.assignedStaffId = staffMemberToSend.userId;

            // check user is connected? if he is not connected refund all lotteries
            // const client = this.clients.findIndex((client) => client.socketId === socketId);
            // if (client === -1) {
            //     this.revokeAllKenoFromUser(userId);
            // }
        }

        if (returnedLotteryIds.length > 0) {
            this.pendingLotteries = this.pendingLotteries.filter(lottery => !returnedLotteryIds.includes(lottery.id));
        }
    }
}
