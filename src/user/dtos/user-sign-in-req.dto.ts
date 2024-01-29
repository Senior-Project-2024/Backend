import { IsEmail, IsString } from "class-validator";

export class UserSignInReqDto {

  @IsEmail()
  email: string;

  @IsString()
  password: string;

}