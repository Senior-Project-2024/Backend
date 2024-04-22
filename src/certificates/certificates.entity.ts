import { Entity, Column, ObjectIdColumn } from "typeorm";
import { ExpireDto } from "src/dtos/expire.dto";
import { ImageDto } from "src/dtos/image.dto";

@Entity()
export class Certificate {

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
  linkCourse: string

  @Column()
  organizeName: string;

  @Column()
  skill: string[];

  @Column()
  expiration: ExpireDto;

  @Column()
  imageInfo: ImageDto;

  @Column()
  badgeRequired: string[];

  @Column()
  userId: string;

}