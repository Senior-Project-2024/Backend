import { IsEmail, IsOptional, IsString } from 'class-validator';
import { KeyStore } from 'web3';

export class UpdateUserDto {

  @IsEmail()
  @IsOptional()
  email: string;

  @IsString()
  @IsOptional()
  password: string;

  @IsString()
  @IsOptional()
  newPassword: string;
  
  @IsString()
  @IsOptional()
  organizeName: string;

  @IsString()
  @IsOptional()
  fName: string;

  @IsString()
  @IsOptional()
  lName: string;

  @IsString()
  @IsOptional()
  telNo: string;

  @IsString()
  @IsOptional()
  landlineNumber : string;

  @IsString()
  @IsOptional()
  keyStoreJsonV3: KeyStore;

}