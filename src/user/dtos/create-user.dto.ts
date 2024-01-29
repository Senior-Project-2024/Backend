import { IsEmail, IsEnum, IsPhoneNumber, IsString } from "class-validator";
import { UserRole } from '../user.constant';

export class CreateUserDto {

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  username: string;

  @IsString()
  fName: string;

  @IsString()
  lName: string;

  @IsPhoneNumber('TH')
  telNo: string;

  @IsEnum(UserRole)
  role: UserRole;

}