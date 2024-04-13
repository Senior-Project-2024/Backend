import { Expose, Type } from "class-transformer"
import { UserSignInRespDto } from "./user-sign-in-resp.dto"

export class UserSessionDto {

  @Expose()
  @Type(() => UserSignInRespDto)
  user: UserSignInRespDto;

  @Expose()
  @Type(() => UserSignInRespDto)
  organize: UserSignInRespDto;

} 