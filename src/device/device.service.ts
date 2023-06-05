import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Device, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateDeviceTokenTO } from './dto';
import FirebaseService from '../firebase/firebase-app'
import { nDate } from 'src/common/utils';
import { errorMessage } from 'src/common/error_message';

@Injectable()
export class DeviceService {
    constructor(
        private prismaService: PrismaService,
        private firebaseService: FirebaseService
    ) { }

    async updateDeviceToken(user: User, data: UpdateDeviceTokenTO): Promise<Device> {
        const device = await this.prismaService.device.findFirst({
            where: {
                deviceId: data.deviceId,
                userId: user.id
            }
        })

        if (!device) throw new NotFoundException(errorMessage.DEVICE_NOT_FOUND);

        const deviceUpdated = await this.prismaService.device.update({
            where: { id: device.id },
            data: {
                deviceToken: data.deviceToken,
                lastLogin: new nDate()
            }
        })

        return deviceUpdated;
    }

    async getFirebaseToken(user: User) {
        return await this.firebaseService.getTokenFromPhoneNumber(user.phoneNumber)
    }
}