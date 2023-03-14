import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
import { GetUser } from '../auth/decorator';
import { UserService } from './user.service';
import { UserDTO } from './dto';
// import { User } from '@prisma/client'; 
import { User } from '../../node_modules/.prisma/client'; 
import { MyJwtGuard } from 'src/auth/guard';

@Controller('users')
export class UserController {
    constructor(private userService: UserService) {
    }
    // @UseGuards(AuthGuard('jwt'))
    @UseGuards(MyJwtGuard)
    @Get('get-info')
    getUserInfo(@GetUser() user: User) {
        return user
    }

    @UseGuards(MyJwtGuard)
    @Post('update-info')
    updateUserInfo(@GetUser() user: User, @Body() body: UserDTO) {
        return this.userService.updateUserInfo(user, body)
    }
}
