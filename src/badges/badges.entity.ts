import { Entity, Column, ObjectIdColumn } from "typeorm";
import { ExpireObject } from "./entitys/expire.entity";
import { BadgeImageObject } from "./entitys/badge-image.entity";

@Entity()
export class Badge {

  @ObjectIdColumn()
  id: string;

  @Column()
  name: string;

  @Column()
  descriptionCourse: string;

  @Column()
  earningCriteria: string;

  @Column()
  templateCode: string;

  @Column()
  organizeName: string;

  @Column()
  skill: string[];

  @Column()
  expiration: ExpireObject;

  @Column()
  imageInfo: BadgeImageObject;

  @Column()
  userId: string;

}