import { Body, Controller, Get, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { UpdateImageDTO } from './dto';
import { LotteryService } from './lottery.service';

@Controller('lottery')
export class LotteryController {

    constructor(private lotteryService: LotteryService) { }

    // @UseGuards(MyJwtGuard, RolesGuard)
    // @Post('update-image')
    // @Roles(Role.Staff)
    // confirmOrder(@Body() body: UpdateImageDTO) {
    //     return this.lotteryService.updateImage(body)
    // }

    @Post('update-image')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'imgFront', maxCount: 1 },
        { name: 'imgBack', maxCount: 1 },
    ]))
    async addAvatar(
        @Body() body: UpdateImageDTO,
        @UploadedFiles() files: { imgFront?: Express.Multer.File[], imgBack?: Express.Multer.File[] }) {
        return this.lotteryService.updateImage(body, files.imgFront[0], files.imgBack[0])
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('calculate-value')
    @Roles(Role.Staff, Role.Admin, Role.User)
    test(@Query('lotteryId') body: string) {
        return this.lotteryService.calculateTotalBets(body)
    }
}
