import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class SystemService {

    constructor(private prismaService: PrismaService,) { }

    async getSystemConfig() {
        return await this.prismaService.config.findFirst({})
    }
}
