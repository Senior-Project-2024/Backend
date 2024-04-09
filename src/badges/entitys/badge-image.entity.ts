import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class BadgeImageObject {

  imageURL: string;

  mimeType: string;

  originalFilename: string;
}