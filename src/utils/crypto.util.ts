import { createHash, createCipheriv, createDecipheriv, randomBytes, CipherGCM, CipherGCMTypes, DecipherGCM } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';

enum EncodedParams {
  hex = 'hex',
  base64 = 'base64'
}

type EncodedType = 'hex' | 'base64';

@Injectable()
export class Crypto { 

  constructor(private configService: ConfigService) {}

  getSHA256(data: string, encoded: EncodedType): string {
    return createHash('sha256').update(data).digest(encoded);
  }

  encryptAES256(plainText: string, keyName: string, mode: string): string {

    // check config value
    this.checkConfigureValue(keyName, mode);

    const iv: Buffer = randomBytes(12);

    const key: Buffer = Buffer.from(this.configService.get<string>(keyName), 'base64');

    const cipher: CipherGCM = createCipheriv(
      this.configService.get<string>(mode) as CipherGCMTypes,
      key,
      iv
    );

    let encrypted: Buffer = Buffer.concat([cipher.update(plainText, 'utf-8'), cipher.final()]);
    
    const tag = cipher.getAuthTag();

    return Buffer.concat([iv, tag, encrypted]).toString('base64');
  }

  decryptAES256(cipher: string, keyName: string, mode: string): string {

    // check config value
    this.checkConfigureValue(keyName, mode);

    const buffer: Buffer = Buffer.from(cipher, 'base64');

    const iv: Buffer = buffer.subarray(0, 12);
    const tag: Buffer = buffer.subarray(12, 28);
    const encrypted: Buffer = buffer.subarray(28);

    const key: Buffer = Buffer.from(this.configService.get<string>(keyName), 'base64');

    const decipher: DecipherGCM = createDecipheriv(
      this.configService.get<string>(mode) as CipherGCMTypes,
      key,
      iv
    );

    decipher.setAuthTag(tag);

    const decrypted = decipher.update(encrypted, undefined, 'utf-8');

    return decrypted;
  }

  checkConfigureValue(keyName: string, mode: string): void {

    if(
      !this.configService.get<string>(keyName) ||
      !this.configService.get<string>(mode)
    ) {
      throw new Error('Not found key or mode of algorithms');
    }

  }
  
}
