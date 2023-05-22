import { ForbiddenException, Injectable } from '@nestjs/common';
import { Device } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class DeviceService {
    constructor(
        private prismaService: PrismaService,
    ) { }

    async updateDeviceToken(deviceId: string, deviceToken: string): Promise<Device> {
        const device = await this.prismaService.device.findFirst({
            where: {
                deviceId
            }
        })

        if (!device) throw new ForbiddenException("Device does not exist");

        const deviceUpdated = await this.prismaService.device.update({
            where: { id: device.id },
            data: {
                deviceToken
            }
        })

        return deviceUpdated;
    }
}