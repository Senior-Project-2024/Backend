import { Entity, Column, ObjectIdColumn, ObjectId } from "typeorm";
import { KeyStore } from "web3";
import { UserRole } from "./user.constant";

@Entity()
export class User {

  @ObjectIdColumn()
  id: string;
  
  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  organizeName: string;

  @Column()
  fName: string;

  @Column()
  lName: string;

  @Column()
  telNo: string;

  @Column()
  landlineNumber : string;

  @Column()
  keyStoreJsonV3: KeyStore;

  @Column()
  tokenApi: string;

  @Column()
  role: UserRole;
  
  
}