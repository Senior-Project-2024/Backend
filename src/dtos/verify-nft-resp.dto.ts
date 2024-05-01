import { Expose } from "class-transformer";
import { ImageDto } from "./image.dto";

 
export class VerifyNFTResp {

  @Expose()
  name: string;

  @Expose()
  badgeRequired: string[];

  @Expose()
  issuedTo: string;

  @Expose()
  issueBy: string;

  @Expose()
  issueDate: string;

  @Expose()
  expiredDate: string;

  @Expose()
  descriptionCourse: string;

  @Expose()
  earningCriteria: string;

  @Expose()
  imageInfo: ImageDto;

  @Expose()
  skill: string[];

}