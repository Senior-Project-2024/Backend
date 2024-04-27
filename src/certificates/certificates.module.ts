import { UserModule } from './../user/user.module';
import { Module } from '@nestjs/common';
import CertificatesController from './certificates.controller';
import { CertificatesService } from './certificates.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './certificates.entity';
import { HttpModule } from '@nestjs/axios';
import { BlockChainService } from 'src/blockchian.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { NFTStorageClientUtil } from 'src/utils/nft-storage.util';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Certificate]), HttpModule, CloudinaryModule],
  controllers: [CertificatesController],
  providers: [CertificatesService, BlockChainService, NFTStorageClientUtil],
  exports: [CertificatesService]
})
export class CertificatesModule {}
