import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/enum';
import { ROLES_KEY } from '../decorator';
import { errorMessage } from 'src/common/error_message';

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
        if (!user) throw new UnauthorizedException(errorMessage.USER_NOT_FOUND)
        //@ts-ignore
        return requiredRoles.some((role) => user.role?.includes(role));
    }
}