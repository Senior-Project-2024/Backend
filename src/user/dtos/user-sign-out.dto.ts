import { IsEnum } from "class-validator";
import { UserRole } from "../user.constant";

export class UserSignOutReqDto {

  @IsEnum(UserRole)
  role: UserRole;

}