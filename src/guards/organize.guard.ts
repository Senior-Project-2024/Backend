import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UserRole } from 'src/user/user.constant';

@Injectable() 
export class OrganizeGuard implements CanActivate {

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const request = context.switchToHttp().getRequest();

      return request.currentOrganize;
  }
}