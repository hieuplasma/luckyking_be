import { Injectable } from '@nestjs/common';
import { User } from '../../node_modules/.prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDTO } from './dto';

@Injectable()
export class OrderService {
    constructor(private prismaService: PrismaService) { }
    
    async createOrder (user: User, body: CreateOrderDTO) {

    }
}
