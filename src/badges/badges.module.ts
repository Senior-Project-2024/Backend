import { Module } from '@nestjs/common';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { UserModule } from 'src/user/user.module';
import { BlockChainService } from 'src/blockchian.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from './badges.entity';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { HttpModule } from '@nestjs/axios';
import { NFTStorageClientUtil } from 'src/utils/nft-storage.util';

@Module({
  imports: [UserModule, TypeOrmModule.forFeature([Badge]), CloudinaryModule, HttpModule],
  controllers: [BadgesController],
  providers: [BadgesService, BlockChainService, NFTStorageClientUtil]
})
export class BadgesModule {}
