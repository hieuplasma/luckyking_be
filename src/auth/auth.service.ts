import { Injectable } from "@nestjs/common";

@Injectable({})
export class AuthService {

    constructor() {

    }
    doSomething() {
        console.log("authservie.dosomething")
    }

    register() {
        return {
            message: "Register an account"
        }
    }

    login() {
        return {
            message: "Login to an account"
        }
    }
}