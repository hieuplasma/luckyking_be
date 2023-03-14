import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';
import { UserDTO } from './dto';
// import { MyJwtGuard } from '../auth/guard';


@Controller('users')
export class UserController {
    constructor(private userService: UserService) {
    }
    // @UseGuards(AuthGuard('jwt'))
    @UseGuards(AuthGuard('jwt'))
    @Get('get-info')
    getUserInfo(@GetUser() user: User) {
        return user
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('update-info')
    updateUserInfo(@GetUser() user: User, @Body() body: UserDTO) {
        return this.userService.updateUserInfo(user, body)
    }
}
