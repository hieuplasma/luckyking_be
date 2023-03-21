import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// import { Request } from 'express';
import { GetUser, Roles } from '../auth/decorator';
import { UserService } from './user.service';
import { UserDTO } from './dto';
// import { User } from '@prisma/client'; 
import { User } from '../../node_modules/.prisma/client'; 
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';

@Controller('users')
export class UserController {
    constructor(private userService: UserService) {
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-info')
    @Roles(Role.Admin, Role.User, Role.Staff)
    getUserInfo(@GetUser() user: User) {
        return this.userService.getUserInfo(user)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('update-info')
    @Roles(Role.Admin, Role.User, Role.Staff)
    updateUserInfo(@GetUser() user: User, @Body() body: UserDTO) {
        return this.userService.updateUserInfo(user, body)
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-all-user')
    @Roles(Role.Admin)
    getAllUser() {
        return this.userService.getAllUser()
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('get-all-wallet')
    @Roles(Role.User)
    getAllWallet(@GetUser() user: User) {
        return this.userService.getAllWallet(user.id)
    }
}
