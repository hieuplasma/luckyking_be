import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SystemService {

    constructor(private prismaService: PrismaService,) { }

    async getSystemConfig() {
        const config = await this.prismaService.config.findFirst({})
        delete config.zaloToken
        delete config.zaloRefeshToken
        return config
    }

    async getCurrentPopup() {
        const popup = await this.prismaService.popup.findFirst({
            orderBy: { id: 'desc' },
            take: 1
        })

        if (popup) {
            delete popup.updateStaffId
            delete popup.createdAt
            delete popup.updatedAt
        }
        return popup
    }
}
