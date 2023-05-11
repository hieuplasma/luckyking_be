import { Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { GetUser, Roles } from 'src/auth/decorator';
import { MyJwtGuard, RolesGuard } from 'src/auth/guard';
import { Role } from 'src/common/enum';
import { fileNameConvert } from 'src/common/utils';
import { UpdateImageDTO, PrintDTO } from './dto';
import { UpdateLotteryNumbersDTO } from './dto/update-lottery-numbers.dto';
import { IUpdateLotteryNumber } from './interfaces';
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
        return new Promise((res) => {
            setTimeout(() => {
                res('ok')
            }, 2000)
        })
        // return 'ok'
    }

    @Post('print')
    async confirmPrintLottery(@Body() data: PrintDTO) {
        const { lotteryId } = data;
        return await this.lotteryService.confirmPrintLottery(lotteryId)
    }

    @Get(':lotteryId')
    async getLotteryById(@Param('lotteryId') lotteryId: string) {
        return await this.lotteryService.getLotteryById(lotteryId)
    }

    @Patch(':lotteryId')
    async updateLotteryNumbers(@Param('lotteryId') lotteryId: string, @Body() data: UpdateLotteryNumbersDTO) {
        return await this.lotteryService.updateLotteryNumbers(lotteryId, data);
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
    @Post('update-keno-image')
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'imgFront', maxCount: 1 },
    ], {
        storage: diskStorage({
            destination: 'uploads/images',
            filename(req, file, callback) {
                if (file) {
                    const ext = file.originalname.split('.').pop();
                    const fileName = `${fileNameConvert(req.body.lotteryId)}.${ext}`;
                    console.log(fileName)
                    callback(null, fileName)
                }
            },
        })
    }))
    async updateKenoImage(
        @Body() body: UpdateImageDTO,
        @UploadedFiles() files: { imgFront?: Express.Multer.File[] }) {
        return this.lotteryService.updateKenoImage(body, files.imgFront[0])
    }

    @UseGuards(MyJwtGuard, RolesGuard)
    @Get('calculate-value')
    @Roles(Role.Staff, Role.Admin, Role.User)
    test(@Query('lotteryId') body: string) {
        return this.lotteryService.calculateTotalBets(body)
    }
}
