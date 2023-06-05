import { createParamDecorator, ExecutionContext, NotFoundException } from '@nestjs/common';
import { errorMessage } from 'src/common/error_message';

export const GetUser = createParamDecorator(
  (key: string, context: ExecutionContext) => {    
    const request:Express.Request = context.switchToHttp().getRequest();    
    const user = request.user
    if (!user) throw new NotFoundException(errorMessage.USER_NOT_FOUND)
    return key ? user?.[key] : user
  },
);