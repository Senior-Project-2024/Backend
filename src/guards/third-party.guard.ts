import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from 'src/user/auth.service';

@Injectable()
export class ThirdPartyGuard implements CanActivate {

  constructor(private authService: AuthService) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

    const request = context.switchToHttp().getRequest();

    return request.headers.authorization && this.authService.verifyTokenApi(request.headers.authorization.split(' ')[1]);
  }
}