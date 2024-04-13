import {
  Injectable,
  NestMiddleware
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { User } from '../user.entity';
import { UserService } from '../user.service';

declare global {
  namespace Express { // find Express lib
    interface Request { // add properties in request
      currentUser?: User;
      currentOrganize?: User;
    }
  }
}


@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {
  
  constructor(
    private userService: UserService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const { userId, organizeId } = req.session || {};

    if(userId) {
      const user = await this.userService.findOne(userId);
      req.currentUser = user;
    }

    if(organizeId) {
      const organize = await this.userService.findOne(organizeId);
      req.currentOrganize = organize;
    } 

    next();
  }
}