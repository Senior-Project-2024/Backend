import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class ExpireObject {

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ type }) => Number(type))
  year: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ type }) => Number(type))
  month: number;

  @IsNumber()
  @IsNotEmpty()
  @Transform(({ type }) => Number(type))
  day: number;
}