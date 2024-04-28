import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ObjectId } from 'mongodb';
import { BadgeResp, BadgeStructOutput, BlockChainService } from 'src/blockchian.service';
import { CloudinaryResponse } from 'src/cloudinary/cloudinary-response';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { DateUtil } from 'src/utils/date.util';
import { NFTStorageClientUtil } from 'src/utils/nft-storage.util';
import { ContractABI } from 'src/utils/smart-contract/contractABI';
import { MongoRepository } from 'typeorm';
import { Contract, Web3BaseWalletAccount } from 'web3';
import { Badge } from './badges.entity';
import { CreateBadgeTemplateDto } from './dtos/create-badge-template.dto';
import { ImageDto } from 'src/dtos/image.dto';
import { UserService } from 'src/user/user.service';

@Injectable() 
export class BadgesService {

  constructor(
    private userService: UserService,
    private blockchainService: BlockChainService,
    private cloudinaryService: CloudinaryService,
    private httpService: HttpService,
    private nftStorageClientUtils: NFTStorageClientUtil,
    @InjectRepository(Badge) private badgeRepo: MongoRepository<Badge>
  ) {}

  async createTemplate(badgeTemplateDto: CreateBadgeTemplateDto, organizationId: string, image: Express.Multer.File)  {
    const uploadedImage: CloudinaryResponse = await this.cloudinaryService.uploadImage(image);
    const imageInfo: ImageDto = {
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
      const imageInfo: ImageDto = {
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

    return this.badgeRepo.find( { where: { userId: new ObjectId(userId) } } );
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

  async mintBadge(userPublicKey: string, templateCode: string, evidenceURL: string) {

    /* call dependencies for minting user badge to our smart contracts */
    /* 1. our app wallet (server wallet)  */
    /* 2. smart contract */
    const serverWallet: Web3BaseWalletAccount = this.blockchainService.addServerWalletForSignTransaction();
    const contract: Contract<ContractABI>  = this.blockchainService.getSmartContract();

    /* prepare user data for minting */
    /* 1. userPublicKey from params */
    /* 2. query badge template for create instance of badge */

    const badgeTemplate: Badge = await this.findOne(templateCode);

    const startMillisecs: number = Date.now();
    const expireMillisecs: number = DateUtil.addCurrentDateWithYMDInMillisecs
    (
      badgeTemplate.expiration.year,
      badgeTemplate.expiration.month,
      badgeTemplate.expiration.day
    );
    /* warn! convert to unix before send to smart contract */
    /* because smart contract use unix time */

    /* create user badge for minting and store it on our smart contracts  */
    const userBadge = { 
      issuedBy: badgeTemplate.organizeName,
      issueUnixTime: DateUtil.millisecToUnix(startMillisecs),
      expireUnixTime: DateUtil.millisecToUnix(expireMillisecs),
      templateCode,
      evidenceURL
    };

    /* create metadata of badge */
    const imageBlob: ArrayBuffer | null = await this.getBadgeBlobFromImageURL(badgeTemplate.imageInfo.imageURL);

    if(!imageBlob) {
      throw new NotFoundException('Not Found Image Blob of Badge Image.');
    }

    const metadata = await this.nftStorageClientUtils.uploadNFTMetaDataofBadge(badgeTemplate, imageBlob);

    if(!metadata) {
      throw new BadRequestException('Can not upload metadata of nft');
    }

    try {
      await contract.methods.safeMintBadge(
        userPublicKey,
        userBadge,
        metadata.url
      ).send({
        from: serverWallet.address,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }

    /* remove server account from wallet of provider */
    this.blockchainService.removeServerWalletForSignTransaction();
  
  }

  async getAllBadgeUser(userPublicKey: string ){
    const contract : Contract<ContractABI> = this.blockchainService.getSmartContract();
    const userPocketBadgeFromSmartContract = await contract.methods.getUserBadgePocket(userPublicKey).call()
    const userPocketBadge: BadgeResp[] = await this.blockchainService.mappingBadgeFromSol(userPocketBadgeFromSmartContract); 
    
    /* filter expired badge out  */
    const userPocketBadgeNotExpired: BadgeResp[] = userPocketBadge.filter( (userBadge) => (userBadge.expireUnixTime > DateUtil.currentUnixTime() || Number(userBadge.expireUnixTime) === 0 ) )
    
    /* Add data from DB w/templateCode */
    const userPocketBadgeNotExpiredMapData = await Promise.all(userPocketBadgeNotExpired.map( async (userBadge)=>{
      const templateBadgeData : Badge = await this.findOne(userBadge.templateCode)
      return {
        ...templateBadgeData,
        id : userBadge.id,
        issuedBy : userBadge.issuedBy,
        evidenceURL : userBadge.evidenceURL,
        issuedDate : DateUtil.unixToDateString(Number(userBadge.issueUnixTime)),
        expireDate : userBadge.expireUnixTime > 0 ? DateUtil.unixToDateString(Number(userBadge.expireUnixTime)) : "none",
      }
    }))

    /* categorize Organization */
    const userPocketBadgeNotExpiredMapDataCategorize = [];

    userPocketBadgeNotExpiredMapData.forEach((badgeMapData)=>{
      const legnth : number = userPocketBadgeNotExpiredMapDataCategorize.length
      let isfound : boolean = false;
      let i = 0;
      while( (i < legnth) && !isfound) {
        if(badgeMapData.issuedBy === userPocketBadgeNotExpiredMapDataCategorize[i][0].issuedBy){
          userPocketBadgeNotExpiredMapDataCategorize[i].push(badgeMapData)
          isfound = true;
        }
        i++;
      }
      if(isfound === false){
        userPocketBadgeNotExpiredMapDataCategorize.push([badgeMapData])
      }
    })

    console.log(userPocketBadgeNotExpiredMapDataCategorize);

    return userPocketBadgeNotExpiredMapDataCategorize
  }

  async getSpecificBadgeUser(id : string){
    const contract : Contract<ContractABI> = this.blockchainService.getSmartContract();
    let addressFromId : string 
    try{
      addressFromId = await contract.methods.ownerOf(id).call()
    }catch(error){
      throw new NotFoundException(error);
    }
    
    const userPocketBadgeFromSmartContract = await contract.methods.getUserBadgePocket(addressFromId).call()
    const userPocketBadge: BadgeResp[] = await this.blockchainService.mappingBadgeFromSol(userPocketBadgeFromSmartContract); 
    
    /* Find Id from userPocketBadge */
    const userPocketBadgeWithId = userPocketBadge.filter((userBadge)=>{
      return userBadge.id.toString() === id;
    })
    
    /* Get badgeTemplete */
    const badgeTemplateDB : Badge = await this.findOne(userPocketBadgeWithId[0].templateCode)

    /* Get User from DB */
    const userDetail = await this.userService.findByPublicKey(addressFromId.slice(2))

    if(userDetail.length === 0){
      throw new NotFoundException('user not found!');
    }

    return {
      ...badgeTemplateDB,
      id : userPocketBadgeWithId[0].id,
      issuedBy : userPocketBadgeWithId[0].issuedBy,
      evidenceURL : userPocketBadgeWithId[0].evidenceURL,
      issuedDate : DateUtil.unixToDateString(Number(userPocketBadgeWithId[0].issueUnixTime)),
      expireDate : userPocketBadgeWithId[0].expireUnixTime > 0 ? DateUtil.unixToDateString(Number(userPocketBadgeWithId[0].expireUnixTime)) : "none",
      firstName : userDetail[0].fName,
      lastName : userDetail[0].lName
    }
    
  }

}

