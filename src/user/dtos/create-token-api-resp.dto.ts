import { Expose } from 'class-transformer';
import { ObjectId } from 'mongodb';

export class CreateTokenApiRespDto {

  @Expose()
  id: string;

  @Expose()
  tokenApi: string;
}