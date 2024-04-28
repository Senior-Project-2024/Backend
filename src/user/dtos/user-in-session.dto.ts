import { Expose, Type } from "class-transformer";
import { KeyStore } from "web3";
import { UserRole } from "../user.constant";

export class UserInSessionDto{ 

  @Expose()
  @Type(() => String)
  id: string;

  @Expose()
  email: string;

  password: string;

  @Expose()
  organizeName: string;

  @Expose()
  fName: string;

  @Expose()
  lName: string;

  @Expose()
  telNo: string;

  @Expose()
  keyStoreJsonV3: KeyStore;

  @Expose()
  tokenApi: string;

  @Expose()
  landlineNumber : string;

  @Expose()
  role: UserRole;


}