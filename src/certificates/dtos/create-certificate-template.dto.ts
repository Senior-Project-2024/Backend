import { IsString, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { ExpireDto } from "src/dtos/expire.dto";

export class CreateCertificateTemplateDto {

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

  @IsArray()
  @IsString({
    each: true
  })
  badgeRequired: string[];

  @ValidateNested({ each: true })
  @Type(() => ExpireDto)
  expiration: ExpireDto;

}