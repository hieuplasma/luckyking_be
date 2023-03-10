import { Injectable } from "@nestjs/common";
import { PrismaService } from "..//prisma/prisma.service";

@Injectable({})
export class AuthService {

    constructor(private prismaService: PrismaService) {

    }

    register() {
        return {
            message: "Register an account"
        }
    }

    login() {
        return {
            message: "Login to an account"
        }
    }
}