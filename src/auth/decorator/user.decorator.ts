import { createParamDecorator, ExecutionContext, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UserStatus } from 'src/common/enum';
import { errorMessage } from 'src/common/error_message';

export const GetUser = createParamDecorator(
  (key: string, context: ExecutionContext) => {
    const request: Express.Request = context.switchToHttp().getRequest();
    const user = request.user
    if (!user) throw new NotFoundException(errorMessage.USER_NOT_FOUND)
    // @ts-ignore
    if (user.status == UserStatus.Block) throw new UnauthorizedException(errorMessage.BLOCKED_ACCOUNT.replace('phone', user.phoneNumber));
    return key ? user?.[key] : user
  },
);