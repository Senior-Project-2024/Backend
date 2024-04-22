import { Transform } from "class-transformer";
import { IsNotEmpty, IsNumber } from "class-validator";

export class ExpireDto {

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  year: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  month: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ value }) => Number(value))
  day: number;


}