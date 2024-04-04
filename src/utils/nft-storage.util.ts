import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NFTStorage, File, Blob, CIDString } from 'nft.storage';
import { Badge } from 'src/badges/badges.entity';

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

  async uploadNFTMetaData(badge: Badge, imageBlob: ArrayBuffer){
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


}