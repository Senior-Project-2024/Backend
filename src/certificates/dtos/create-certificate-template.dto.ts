import { IsString, IsArray, ValidateNested, IsOptional } from "class-validator";
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
  organizeName: string;
  
  @IsOptional()
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