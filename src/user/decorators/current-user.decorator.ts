import {
  createParamDecorator,
  ExecutionContext
} from '@nestjs/common';


// data => parameter that pass in () of decorator
// ex. @CurrentUser('hello') => data = hello
export const CurrentUser = createParamDecorator(
  (data: never, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.currentUser;
  },
);