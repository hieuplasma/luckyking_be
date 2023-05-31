import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { DeviceService } from './device.service';
import { UpdateDeviceTokenTO } from './dto';
import { MyJwtGuard } from 'src/auth/guard';
import { GetUser } from 'src/auth/decorator';
import { User } from '@prisma/client';

@Controller('device')
export class DeviceController {

    constructor(private deviceService: DeviceService) { }

    @UseGuards(MyJwtGuard)
    @Post('update-token')
    async print(@GetUser() user: User, @Body() data: UpdateDeviceTokenTO) {
        return await this.deviceService.updateDeviceToken(user, data);
    }

    @UseGuards(MyJwtGuard)
    @Get("get-firebase-token")
    getFirebaseToken(@GetUser() user: User) {
        return this.deviceService.getFirebaseToken(user)
    }
}