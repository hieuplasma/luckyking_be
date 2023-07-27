import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthDTO, CheckAuthDTO, CreateStaffDTO, ForgotPassWordDTO, UpdatePassWordDTO } from "./dto";
import { RegisterDTO } from "./dto/register.dto";
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {
    }

    @Post("check")
    check(@Body() body: CheckAuthDTO) {
        return this.authService.check(body)
    }

    @Post("register")
    registerCheate(@Body() body: RegisterDTO) {
        return this.authService.register(body)
    }

    @Post("sercure/register")
    register(@Body() body: RegisterDTO) {
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

    @Post("super-login")
    superLogin(@Body() body: AuthDTO) {
        return this.authService.superLogin(body)
    }

    @Post("update-password")
    updatePassword(@Body() body: UpdatePassWordDTO) {
        return this.authService.updatePassword(body)
    }

    @Post("/sercure/forgot-password")
    forgotPassword(@Body() body: ForgotPassWordDTO) {
        return this.authService.forgotPassword(body)
    }

    @Post("forgot-password")
    cheateForgotPassword(@Body() body: ForgotPassWordDTO) {
        return this.authService.forgotPassword(body)
    }

    @Post("verify-firebase")
    verifyFirebase(@Body() body: AuthDTO) {
        console.log("lmao lmao:::", body)
    }

    @Post("delete-account")
    deleteAccount(@Body() body: AuthDTO) {
        return this.authService.deleteAccount(body)
    }

    @Post("/unverified-login")
    unverifiedLogin(@Body() body: AuthDTO) {
        return this.authService.unverifiedLogin(body)
    }

    @Post("/otp-verified/login")
    verifiedLogin(@Body() body: AuthDTO) {
        return this.authService.login(body)
    }

    @Post("/otp-verified/register")
    verifiedRegister(@Body() body: RegisterDTO) {
        return this.authService.register(body)
    }

    @Post("/otp-verified/forgot-password")
    verifiedForgotPassword(@Body() body: ForgotPassWordDTO) {
        return this.authService.forgotPassword(body)
    }
} 