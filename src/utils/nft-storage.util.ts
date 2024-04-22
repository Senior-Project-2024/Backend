import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CIDString, File, NFTStorage } from 'nft.storage';
import { Badge } from 'src/badges/badges.entity';
import { Certificate } from 'src/certificates/certificates.entity';

@Injectable()
export class NFTStorageClientUtil {

  constructor(
    private configService: ConfigService
  ) { }

  createClient(): NFTStorage {
    return new NFTStorage({ token: this.configService.get<string>('NFT_STORAGE_TOKEN_API') });
  }

  getNFTMetaDataLink(cid: string): CIDString {
    return `ipfs://${cid}/image`
  }

  async uploadNFTImage(image: Express.Multer.File): Promise<CIDString> {
    return await this.createClient().storeBlob(new File([image.buffer], 'image', { type: `image/${image.mimetype}` }));
  }

  async uploadNFTMetaDataofBadge(badge: Badge, imageBlob: ArrayBuffer){
    return await this.createClient().store({
      name: badge.name,
      description: badge.descriptionCourse,
      image: new File(
        [imageBlob], 
        `${badge.name}.${badge.imageInfo.mimeType}`, 
        { type: `image/${badge.imageInfo.mimeType}` }
        ) 
    });
  }

  async uploadNFTMetaDataofCertificate(certificate: Certificate, imageBlob: ArrayBuffer){
    return await this.createClient().store({
      name: certificate.name,
      description: certificate.descriptionCourse,
      image: new File(
        [imageBlob], 
        `${certificate.name}.${certificate.imageInfo.mimeType}`, 
        { type: `image/${certificate.imageInfo.mimeType}` }
        ) 
    });
  }


}