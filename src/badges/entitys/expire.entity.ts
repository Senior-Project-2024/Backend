import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class ExpireObject {

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