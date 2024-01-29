import { Expose } from 'class-transformer';

export class ResponseDto {
  @Expose()
  status: number;

  @Expose()
  message: string;

  setStatus(status: number): void {
    this.status = status;
  }

  setMessage(message: string): void {
    this.message = message;
  }
  
}