import { ConfigService } from '@nestjs/config';
import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class HostGuard implements CanActivate {

  constructor(
    private configService: ConfigService
  ) {}
  
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
      const request: Request = context.switchToHttp().getRequest();
      return request.headers.host === this.configService.get<string>('HOST_IP');
  }
}