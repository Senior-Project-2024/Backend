import {
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common';
import { UserRole } from '../user.constant';

// data => parameter that pass in () of decorator
// ex. @CurrentUser('hello') => data = hello
export const CurrentUser = createParamDecorator(
  (data: UserRole, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if(data === UserRole.organization) {
      return request.currentOrganize;
    }

    return request.currentUser;

  },
);