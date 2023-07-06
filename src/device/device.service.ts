import { Injectable } from '@nestjs/common';
import { Device, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateDeviceTokenTO } from './dto';
import FirebaseService from '../firebase/firebase-app'
import { nDate } from 'src/common/utils';

@Injectable()
export class DeviceService {
    constructor(
        private prismaService: PrismaService,
        private firebaseService: FirebaseService
    ) { }

    async updateDeviceToken(user: User, data: UpdateDeviceTokenTO): Promise<Device> {
        let device = await this.prismaService.device.findFirst({
            where: {
                deviceId: data.deviceId,
                userId: user.id
            }
        })
        if (!device) {
            device = await this.prismaService.device.create({
                data: {
                    deviceId: data.deviceId,
                    userId: user.id,
                    lastLogin: new nDate(),
                    deviceToken: data.deviceToken
                }
            })
        }
        else {
            device = await this.prismaService.device.update({
                where: { id: device.id },
                data: {
                    lastLogin: new nDate(),
                    deviceToken: data.deviceToken
                }
            })
        }

        return device;
    }

    async getFirebaseToken(user: User) {
        return await this.firebaseService.getTokenFromPhoneNumber(user.phoneNumber)
    }
}