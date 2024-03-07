import { Expose, Type } from "class-transformer";
import { KeyStore } from "web3";
import { EthWallet } from "../entitys/eth-wallet.entity";
import { UserRole } from "../user.constant";

export class UserSignInRespDto{ 

  @Expose()
  id: string;

  @Expose()
  email: string;

  password: string;

  organizeName: string;

  @Expose()
  fName: string;

  @Expose()
  lName: string;

  @Expose()
  telNo: string;

  keyStoreJsonV3: KeyStore;

  tokenApi: string;

  @Expose()
  role: UserRole;

  @Expose()
  @Type(() => EthWallet)
  ethWallet: EthWallet;


}