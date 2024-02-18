import { IsEmail, IsEnum, IsNotEmpty, IsPhoneNumber, IsString, Validate, ValidateIf } from "class-validator";
import { UserRole } from '../user.constant';
import { IsThaiLandlineNumber } from "src/validators/thai-landline.validator";

export class CreateUserDto {

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @ValidateIf((o) => o.role === UserRole.organization)
  @IsString()
  @IsNotEmpty()
  organizeName: string;

  @IsString()
  fName: string;

  @IsString()
  lName: string;private

  @ValidateIf((o) => o.role === UserRole.user)
  @IsPhoneNumber('TH')
  telNo: string;

  @ValidateIf((o) => o.role === UserRole.organization)
  @Validate(IsThaiLandlineNumber, {
    message: 'Please provide a valid Thai landline number'
  })
  landlineNumber: string;

  @IsEnum(UserRole)
  role: UserRole

}