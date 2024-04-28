import { Expose, Type } from "class-transformer";
import { UserInSessionDto } from './user-in-session.dto';

export class UserSessionDto {

  @Expose()
  @Type(() => UserInSessionDto)
  user: UserInSessionDto;

  @Expose()
  @Type(() => UserInSessionDto)
  organize: UserInSessionDto;

} 