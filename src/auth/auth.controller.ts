import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO, CheckAuthDTO } from "./dto";
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post("check")
    check(@Body() body: CheckAuthDTO) {
        return this.authService.check(body)
    }

    @Post("register")
    register(@Body() body: AuthDTO) {
        return this.authService.register(body)
    }

    @Post("login")
    login(@Body() body: AuthDTO) {
        return this.authService.login(body)
    }
} 