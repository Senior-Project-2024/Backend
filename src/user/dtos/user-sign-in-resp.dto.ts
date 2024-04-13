import { Expose, Transform, Type } from "class-transformer";
import { KeyStore } from "web3";
import { EthWallet } from "../entitys/eth-wallet.entity";
import { UserRole } from "../user.constant";

export class UserSignInRespDto{ 

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

  keyStoreJsonV3: KeyStore;

  @Expose()
  tokenApi: string;

  @Expose()
  landlineNumber : string;

  @Expose()
  role: UserRole;

  @Expose()
  @Type(() => EthWallet)
  ethWallet: EthWallet;


}