import { Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
        // authService.doSomething();
    }

    @Post("register")
    register() {
        // return this.authService.register()
        return this.authService.register()
    }

    @Post("login")
    login() {
        return this.authService.login()
    }
} 