import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Controller('users')
export class UserController {
    @UseGuards(AuthGuard('jwt'))
    @Get('user-info')
    getUserInfo(@Req() request: Request) {
        console.log(request.user)
        return request.user
    }
}
