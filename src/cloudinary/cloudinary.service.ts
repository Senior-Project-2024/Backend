import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryResponse } from './cloudinary-response';
import * as toStream from 'buffer-to-stream';

@Injectable()
export class CloudinaryService {

  async uploadImage(image: Express.Multer.File): Promise<CloudinaryResponse>{
    return new Promise<CloudinaryResponse>( (resolve, reject) => {
      
      const uploadStream = cloudinary.uploader.upload_stream(
        (err, result) => {
          if(err) return reject(err);
          resolve(result)
        }
      );

      toStream(image.buffer).pipe(uploadStream);
    }); 
  }
}
