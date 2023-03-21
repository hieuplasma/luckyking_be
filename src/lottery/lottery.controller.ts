import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { UpdateImageDTO } from './dto';
import { LotteryService } from './lottery.service';

@Controller('lottery')
export class LotteryController {

    constructor(private lotteryService: LotteryService) { }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Post('update-image')
    @Roles(Role.Staff)
    confirmOrder(@Body() body: UpdateImageDTO) {
        return this.lotteryService.updateImage(body)
    }
}
