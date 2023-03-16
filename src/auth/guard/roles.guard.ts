import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/enum';
import { ROLES_KEY } from '../decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const request: Express.Request = context.switchToHttp().getRequest();
        const user = request.user
        console.log(user)
        //@ts-ignore
        return requiredRoles.some((role) => user.role?.includes(role));
    }
}