import { IsEmail, IsString } from "class-validator";
export class ConfirmEmailDto {
  @IsString()
  hashCode : string

  @IsString()
  timeStamp: string;
}