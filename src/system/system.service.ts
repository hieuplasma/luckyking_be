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
}
