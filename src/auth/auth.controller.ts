import { Body, Controller, Post, Req } from "@nestjs/common";
import { AuthService } from "./auth.service";
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post("register")
    register(@Body() body: any) {
        console.log(body)
        return this.authService.register()
    }

    @Post("login")
    login(@Req() request: Request) {
        return this.authService.login()
    }
} 