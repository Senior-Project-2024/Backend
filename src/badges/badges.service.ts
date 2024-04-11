import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Contract, Web3BaseWalletAccount } from 'web3';
import { ContractABI } from 'src/utils/smart-contract/contractABI';
import { BlockChainService } from 'src/blockchian.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { Badge } from './badges.entity';
import { CreateBadgeTemplateDto } from './dtos/create-badge-template.dto';
import { ObjectId } from 'mongodb';
import { DateUtil } from 'src/utils/date.util';
import { CloudinaryResponse } from 'src/cloudinary/cloudinary-response';
import { HttpService } from '@nestjs/axios';
import { NFTStorageClientUtil } from 'src/utils/nft-storage.util';
import { BadgeImageObject } from './entitys/badge-image.entity';

@Injectable() 
export class BadgesService {

  constructor(
    private blockchainService: BlockChainService,
    private cloudinaryService: CloudinaryService,
    private httpService: HttpService,
    private nftStorageClientUtils: NFTStorageClientUtil,
    @InjectRepository(Badge) private badgeRepo: MongoRepository<Badge>
  ) {}

  async createTemplate(badgeTemplateDto: CreateBadgeTemplateDto, organizationId: string, image: Express.Multer.File)  {
    const uploadedImage: CloudinaryResponse = await this.cloudinaryService.uploadImage(image);
    const imageInfo: BadgeImageObject = {
      imageURL: uploadedImage.secure_url,
      mimeType: uploadedImage.format,
      originalFilename: image.originalname,
    };
    const badgeTemplate: Badge = this.badgeRepo.create({
      ...badgeTemplateDto,
      imageInfo,
      userId: organizationId
    });

    return this.badgeRepo.save(badgeTemplate);
  }

  async updateTemplete(badgeTemplateDto: CreateBadgeTemplateDto, organizationId: string, image: Express.Multer.File | undefined, badgeId : string){
    if(image){
      const uploadedImage: CloudinaryResponse = await this.cloudinaryService.uploadImage(image);
      const imageInfo: BadgeImageObject = {
        imageURL: uploadedImage.secure_url,
        mimeType: uploadedImage.format,
        originalFilename: image.originalname,
      };
      await this.update(badgeId,{
        ...badgeTemplateDto,
        imageInfo,
        userId: organizationId
      })
    }else{
      await this.update(badgeId,{
        ...badgeTemplateDto,
        userId: organizationId
      })
    }
  }

  async findOne(id: string): Promise<Badge> {

    if(!id) {
      return null;
    }

    return this.badgeRepo.findOneBy({ _id: new ObjectId(id) });
  }

  async findAll(): Promise<Badge[]> {
    return this.badgeRepo.find({});
  }

  async findByUserId(userId: string): Promise<Badge[]> {
    
    if(!userId) {
      return null;
    } 

    return this.badgeRepo.find( { where: { userId } } );
  }
  
  async findByTemplateCode(templateCode: string): Promise<Badge> {
    return this.badgeRepo.findOneBy({ templateCode });
  }

  async update(id: string, attrs: Partial<Badge>) {
    const badge = await this.findOne(id);

    if(!badge) {
      throw new NotFoundException('badge not found!');
    }

    Object.assign(badge, attrs);

    return this.badgeRepo.save(badge);
  }
  
  async remove(id: string) {
    const badge = await this.findOne(id);

    if(!badge) {

    }

    return this.badgeRepo.remove(badge);
  }
  
  async getBadgeBlobFromImageURL(imageURL: string): Promise<ArrayBuffer | null> {

    const imageResponse = await this.httpService.axiosRef.get(imageURL, { responseType: 'arraybuffer'});
    
    if(imageResponse.status !== 200) {
      return null;
    }

    return imageResponse.data;
  }

  async mintBadge(userPrivateKey: string, templateCode: string, evidenceURL: string) {

    /* call dependencies for minting user badge to our smart contracts */
    /* 1. our app wallet (server wallet)  */
    /* 2. smart contract */
    const serverWallet: Web3BaseWalletAccount = this.blockchainService.addServerWalletForSignTransaction();
    const contract: Contract<ContractABI>  = this.blockchainService.getSmartContract();

    /* prepare user data for minting */
    /* 1. userWallet */
    /* 2. query badge template for create instance of badge */
    const userWallet: Web3BaseWalletAccount = this.blockchainService.getWalletByPrivateKey(userPrivateKey);

    const badgeTemplate: Badge = await this.findByTemplateCode(templateCode);

    const startDate: Date = new Date();
    const expireDate: Date = DateUtil.addCurrentDateWithYMD
    (
      badgeTemplate.expiration.year,
      badgeTemplate.expiration.month,
      badgeTemplate.expiration.day
    );

    /* create user badge for minting and store it on our smart contracts  */
    const userBadge = { 
      issuedBy: badgeTemplate.name,
      date: startDate.toISOString().split('T')[0],
      expire: expireDate.toISOString().split('T')[0],
      templateCode: templateCode,
      evidenceURL
    };

    /* create metadata of badge */
    const imageBlob: ArrayBuffer | null = await this.getBadgeBlobFromImageURL(badgeTemplate.imageInfo.imageURL);

    if(!imageBlob) {
      throw new NotFoundException('Not Found Image Blob of Badge Image.');
    }

    const metadata = await this.nftStorageClientUtils.uploadNFTMetaData(badgeTemplate, imageBlob);

    if(!metadata) {
      throw new BadRequestException('Can not upload metadata of nft');
    }

    try {
      await contract.methods.safeMintBadge(
        userWallet.address,
        userBadge,
        metadata.url
      ).send({
        from: serverWallet.address,
      });
    } catch (error) {
      console.log(error);
      throw new BadRequestException(error.innerError.message);
    }

    /* remove server account from wallet of provider */
    this.blockchainService.removeServerWalletForSignTransaction();
  
  }

}

