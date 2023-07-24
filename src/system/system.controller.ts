import { Controller, Get } from '@nestjs/common';
import { SystemService } from './system.service';

@Controller('system')
export class SystemController {
    constructor(private systemService: SystemService) { }

    @Get("config")
    getSystemConfig() {
        return this.systemService.getSystemConfig()
    }
}
