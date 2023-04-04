import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO, CheckAuthDTO, CreateStaffDTO, ForgotPassWordDTO, UpdatePassWordDTO } from "./dto";
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post("check")
    check(@Body() body: CheckAuthDTO) {
        return this.authService.check(body)
    }

    @Post("register")
    registerCheate(@Body() body: AuthDTO) {
        return this.authService.register(body)
    }

    @Post("sercure/register")
    register(@Body() body: AuthDTO) {
        return this.authService.register(body)
    }

    @Post("create-staff")
    createStaff(@Body() body: CreateStaffDTO) {
        return this.authService.createStaff(body)
    }

    @Post("login")
    login(@Body() body: AuthDTO) {
        return this.authService.login(body)
    }

    @Post("update-password")
    updatePassword(@Body() body: UpdatePassWordDTO) {
        return this.authService.updatePassword(body)
    }

    @Post("forgot-password")
    forgotPassword(@Body() body: ForgotPassWordDTO) {
        return this.authService.forgotPassword(body)
    }

    @Post("verify-firebase")
    verifyFirebase(@Body() body: AuthDTO) {
        console.log("lmao lmao:::", body)
    }
} 