import {
  NestMiddleware,
  Injectable
} from '@nestjs/common'
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../user.service';
import { User } from '../user.entity';

declare global {
  namespace Express { // find Express lib
    interface Request { // add properties in request
      currentUser?: User;
    }
  }
}


@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  
  constructor(
    private userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { userId } = req.session || {};

    if(userId) {
      const user = await this.userService.findOne(userId);
      req.currentUser = user;
    }

    next();
  }
}