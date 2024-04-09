import { IsString, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ExpireObject } from "../entitys/expire.entity";

export class CreateBadgeTemplateDto {

  @IsString()
  name: string;

  @IsString()
  descriptionCourse: string;

  @IsString()
  earningCriteria: string;

  @IsString()
  templateCode: string;

  @IsString()
  linkCourse: string;

  @IsString()
  organizeName: string;
  
  @IsArray()
  @IsString({
    each: true
  })
  skill: string[];

  @ValidateNested({ each: true })
  @Type(() => ExpireObject)
  expiration: ExpireObject;
  
}