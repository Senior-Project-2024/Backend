import { IsString, IsArray, ValidateNested, IsOptional } from "class-validator";
import { Type } from "class-transformer";
import { ExpireDto } from "src/dtos/expire.dto";

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
  
  @IsOptional()
  @IsArray()
  @IsString({
    each: true
  })
  skill: string[];

  @ValidateNested({ each: true })
  @Type(() => ExpireDto)
  expiration: ExpireDto;
  
}