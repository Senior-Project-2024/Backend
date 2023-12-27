import { Entity, Column, ObjectIdColumn } from "typeorm";

@Entity()
export class User {

  @ObjectIdColumn()
  id: number;
  
  @Column()
  email: string;

  @Column()
  password: string;

}