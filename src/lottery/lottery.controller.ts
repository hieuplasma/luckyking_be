import { Body, Controller, Get, Param, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { fileNameConvert } from 'src/common/utils';
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


    @Get('print')
    async print(@Query() data: any) {
        console.log(data)
        return 'ok'
    }

    @Get(':lotteryId')
    async getLotteryById(@Param('lotteryId') lotteryId: string) {
        return await this.lotteryService.getLotteryById(lotteryId)
    }

    @Post('update-image')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'imgFront', maxCount: 1 },
        { name: 'imgBack', maxCount: 1 },
    ], {
        storage: diskStorage({
            destination: 'uploads/images',
            filename(req, file, callback) {
                const ext = file.originalname.split('.').pop();
                const fileName = `${fileNameConvert(req.body.lotteryId)}.${ext}`;
                console.log(fileName)
                callback(null, fileName)
            },
        })
    }))
    async updateImage(
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
