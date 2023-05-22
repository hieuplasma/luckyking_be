import { Body, Controller, Patch } from '@nestjs/common';
import { DeviceService } from './device.service';
import { UpdateDeviceTokenTO } from './dto';


@Controller('device')
export class DeviceController {

    constructor(private deviceService: DeviceService) { }

    @Patch('update-token')
    async print(@Body() data: UpdateDeviceTokenTO) {
        const { deviceId, deviceToken } = data;
        return await this.deviceService.updateDeviceToken(deviceId, deviceToken);
    }
}