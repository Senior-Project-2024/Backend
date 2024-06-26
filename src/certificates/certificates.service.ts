import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BadgeResp, BlockChainService, BadgeStructOutput, CertifcateResp, CertificateStructOutput } from 'src/blockchian.service';
import { CloudinaryResponse } from 'src/cloudinary/cloudinary-response';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ImageDto } from 'src/dtos/image.dto';
import { NFTStorageClientUtil } from 'src/utils/nft-storage.util';
import { MongoRepository } from 'typeorm';
import { Certificate } from './certificates.entity';
import { CreateCertificateTemplateDto } from './dtos/create-certificate-template.dto';
import { ObjectId } from 'mongodb';
import { Contract, Web3BaseWalletAccount } from 'web3';
import { ContractABI } from 'src/utils/smart-contract/contractABI';
import { DateUtil } from 'src/utils/date.util';
import { Badge } from 'src/badges/badges.entity';
import { UserService } from 'src/user/user.service';
import { BadgesService } from 'src/badges/badges.service';

export interface BadgeFromDb extends Badge{
  _id: ObjectId;
}

export interface BadgeRequireResult {
  badgeName: string;
  isExist: boolean;
}

type modifierCertificateForMint = {
    certificates: [
        {
            _id: string;
            name: string;
            canMint?: boolean;
            descriptionCourse: string;
            earningCriteria: string;
            templateCode: string;
            linkCourse: string;
            skill: string[];
            expiration: {
                year: number,
                month: number,
                day: number
            },
            imageInfo: {
                imageURL: string;
                mimeType: string;
                originalFilename: string;
            },
            badgeRequired: BadgeFromDb[];
            userId: string[];
            badgeRequiredResult: BadgeRequireResult[];
        }
    ],
    organizeName: string;
}

@Injectable()
export class CertificatesService {
  
  constructor(
    private userService: UserService,
    private blockchainService: BlockChainService,
    private nftStorageClientUtils: NFTStorageClientUtil,
    private httpService: HttpService,
    private cloudinaryService: CloudinaryService,
    @InjectRepository(Certificate) private certificateRepo: MongoRepository<Certificate> 
  ) {}

  async createTemplate(
    createCerTempDto: CreateCertificateTemplateDto,
    organizationId: string,
    image: Express.Multer.File
  ): Promise<Certificate> {
    const uploadedImage: CloudinaryResponse = await this.cloudinaryService.uploadImage(image);
    const imageInfo: ImageDto = {
      imageURL: uploadedImage.secure_url,
      mimeType: uploadedImage.format,
      originalFilename: image.originalname,
    };
    const certificateTemplate: Certificate = this.certificateRepo.create({
      ...createCerTempDto,
      imageInfo,
      userId: organizationId
    });

    return this.certificateRepo.save(certificateTemplate);
  }

  async updateTemplete(badgeTemplateDto: CreateCertificateTemplateDto, organizationId: string, image: Express.Multer.File | undefined, badgeId : string){
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
      });
    }else{
      await this.update(badgeId,{
        ...badgeTemplateDto,
        userId: organizationId
      });
    }
  }

  async findOne(id: string): Promise<Certificate> {

    if(!id) {
      return null;
    }

    return this.certificateRepo.findOneBy({ _id: new ObjectId(id) });
  }

  async findAll(): Promise<Certificate[]> {
    return this.certificateRepo.find({});
  }

  async findByUserId(userId: string): Promise<Certificate[]> {
    
    if(!userId) {
      return null;
    } 

    return this.certificateRepo.find( { where: { userId: new ObjectId(userId) } } );
  }

  async findIdInBadgeRequiredLessThan3(id: string){
    const result = await this.certificateRepo.aggregate([
      {
        $addFields: {
          sizeBadgeRequired: { $size : "$badgeRequired" }
        }
      },
      {
        $match: {badgeRequired: { $all : [id]} }
      },
      {
        $match : {sizeBadgeRequired: {$lt : 3}}
      }
    ]).toArray();
    return result
  }

  async deleteIdBadgeRequiredByBadgeId(badgeId: string){
    this.certificateRepo.updateMany({},{
      // @ts-ignore
      $pull: { badgeRequired : badgeId} 
    })
  }

  async findWithIdAndLinkCollection(id: string): Promise<Certificate> {
    const certificateRepo: Certificate[] = await this.certificateRepo.aggregate([
      {
        $match: { _id: new ObjectId(id)}
      },
      {
        $unwind: '$badgeRequired'
      },
      {
        $addFields: {
          badgeId: { $toObjectId: '$badgeRequired'}
        }
      },
      {
        $lookup: {
          from: 'badge',
          localField: 'badgeId',
          foreignField: '_id',
          as: 'badgeRequired'
        }
      },
      {
        $unset: 'badgeId'
      },
      {
        $unwind: '$badgeRequired'
      },
      {
        $group: {
          _id: '$_id',
          certificates: {
            $first: '$$ROOT'
          },
          badgeRequired: {
            $push: '$badgeRequired'
          }
        }
      },
      {
        $addFields: {
          certificates: { badgeRequired: '$badgeRequired' },
        }
      },
      {
        $replaceRoot: {
          newRoot: '$certificates',
        }
      }
    ]).toArray();

    return certificateRepo[0];
  }

  // findByUserId but add fullBadgeRequired
  async findByUserIdWithBadgename(userId: string){
    return this.certificateRepo.aggregate([
      {
        $match : {
          userId : new ObjectId(userId)
        }
      },
      {
        $unwind: '$badgeRequired'
      },
      {
        $addFields: {
          badgeRequiredTemp: { $toObjectId: '$badgeRequired'}
        }
      },
      {
        $lookup : {
          from: "badge",
          localField: "badgeRequiredTemp",
          foreignField: "_id",
          as: "MovieDetails",
        }
      },
      {
        $group : { 
          _id : "$_id",
          fullBadgeRequire : { $push : {$arrayElemAt: [ "$MovieDetails", 0 ]}},
          doc : { $first :"$$ROOT"}
        }
      },
      {
        $addFields: {
          "doc.fullBadgeRequire" : '$fullBadgeRequire'
        }
      },
      {
        $replaceRoot: {
          newRoot: '$doc'
        }
      },
      {
        $unset: [
          "MovieDetails"
        ]
        
      }
    ]).toArray()
  }

  // findByฺBadgeId which be fullBadgeRequired
  async findByIdWithBadgename(userId: string){
    return this.certificateRepo.aggregate([
      {
        $match : {
          _id : new ObjectId(userId)
        }
      },
      {
        $unwind: '$badgeRequired'
      },
      {
        $addFields: {
          badgeRequiredTemp: { $toObjectId: '$badgeRequired'}
        }
      },
      {
        $lookup : {
          from: "badge",
          localField: "badgeRequiredTemp",
          foreignField: "_id",
          as: "MovieDetails",
        }
      },
      {
        $group : { 
          _id : "$_id",
          fullBadgeRequire : { $push : {$arrayElemAt: [ "$MovieDetails", 0 ]}},
          doc : { $first :"$$ROOT"}
        }
      },
      {
        $addFields: {
          "doc.fullBadgeRequire" : '$fullBadgeRequire'
        }
      },
      {
        $replaceRoot: {
          newRoot: '$doc'
        }
      },
      {
        $unset: [
          "MovieDetails"
        ]
        
      }
    ]).toArray()
  }

  async update(id: string, attrs: Partial<Certificate>): Promise<Certificate> {
    const certificate = await this.findOne(id);

    if(!certificate) {
      throw new NotFoundException('badge not found!');
    }

    Object.assign(certificate, attrs);

    return this.certificateRepo.save(certificate);
  }
  
  async remove(id: string): Promise<Certificate> {
    const certificate = await this.findOne(id);

    if(!certificate) {
      throw new NotFoundException("Not Found Certificate!.");
    }

    return this.certificateRepo.remove(certificate);
  }
  
  async getCertificateBlobFromImageURL(imageURL: string): Promise<ArrayBuffer | null> {

    const imageResponse = await this.httpService.axiosRef.get(imageURL, { responseType: 'arraybuffer'});
    
    if(imageResponse.status !== 200) {
      return null;
    }

    return imageResponse.data;
  }

  async findCertificateUserCanMint(userPublickey: string) {

    /* filter certificate and group it by organize */
    let certificateOfEachOrganize = await this.certificateRepo.aggregate([
      {
       $group: {
        _id: '$organizeName',
        certificates: {
          $push: '$$ROOT'
        }
       } 
      },
      {
        $unwind: '$certificates'
      },
      {
        $unwind: '$certificates.badgeRequired'
      },
      {
        $addFields: {
          certificates : { badgeId: { '$toObjectId': "$certificates.badgeRequired" } }
        }
      },
      {
        $lookup: {
          from: 'badge',
          localField: 'certificates.badgeId',
          foreignField: '_id',
          as: 'certificates.badgeRequired'
        }
      },
      {
        $unset: [
          'certificates.badgeId',
          'certificates.badgeRequired.userId',
          'certificates.userId',
        ]
      },
      {
        $unwind: '$certificates.badgeRequired'
      },
      {
        $group: {
         _id: '$certificates._id',
         certificates: {
           $first: '$certificates',
         },
         badgeRequired: {
          $addToSet: '$certificates.badgeRequired'
         }
        } 
      },
      {
        $addFields: {
          certificates: { badgeRequired: '$badgeRequired' }
        }
      },
      {
        $unset: 'badgeRequired'
      },
      {
        $group: {
         _id: '$certificates.organizeName',
         certificates: {
           $push: '$certificates'
         }
        } 
      },
      {
        $unset: 'certificates.organizeName'
      },
      {
        $addFields: {
          organizeName: '$_id'
        }
      },
      {
        $project: {
          _id: 0
        }
      }
    ]).toArray() as unknown as modifierCertificateForMint[];

    if(certificateOfEachOrganize.length === 0) {
      return [];
    }

    /* get user's badge from smart contract */
    const contract: Contract<ContractABI> = this.blockchainService.getSmartContract();
    const userPocketBadgeFromSmartContract: BadgeStructOutput[] = await contract.methods.getUserBadgePocket(userPublickey).call();
    const userPocketBadge: BadgeResp[] = await this.blockchainService.mappingBadgeFromSol(userPocketBadgeFromSmartContract); 

    /* filter expired badge out  */
    const userPocketBadgeNotExpired: BadgeResp[] = userPocketBadge.filter( (userBadge) => (userBadge.expireUnixTime > DateUtil.currentUnixTime() || userBadge.expireUnixTime == BigInt(0)) ); 
    
    if(userPocketBadgeNotExpired.length === 0) {
      return [];
    }

    /* map which certificate user can mint from user's badge on smart contract */
    userPocketBadgeNotExpired.forEach( (userBadge) => {
      certificateOfEachOrganize = certificateOfEachOrganize.map((certificateEachOrganize) => {
        
        certificateEachOrganize.certificates.forEach((certificate) => {
          // if it's undefined or null set it to empthy array
          if(!certificate.badgeRequiredResult) {
            certificate.badgeRequiredResult = [];
          }

          const index = certificate.badgeRequired.map((badge) => badge._id.toString()).indexOf(userBadge.templateCode);

          if(index > -1 ) {
            certificate.badgeRequiredResult.push({ badgeName: certificate.badgeRequired[index].name, isExist: true });
            certificate.badgeRequired.splice(index, 1);
          }

        }) 

        return certificateEachOrganize;
      });
    });

    /* === stage : check certificate from smart contract */
    const userPocketCertificateFromSmartContract: CertificateStructOutput[] = await contract.methods.getUserCertificatePocket(userPublickey).call();
    const userPocketCertificate: CertifcateResp[] = await this.blockchainService.mappingCertificateFromSol(userPocketCertificateFromSmartContract); 
    
    const userPocketCertificateNotExpired: CertifcateResp[] = userPocketCertificate.filter( (certificate) => (certificate.expireUnixTime > DateUtil.currentUnixTime() || certificate.expireUnixTime == BigInt(0)));
    const userCerTemplateCodeNotExpired: string[] = userPocketCertificateNotExpired.map( (certificateNotExpired) => certificateNotExpired.templateCode );

    /* === stage : two thing to do here !!! */
    /* check if badges required are empty it's mean canMint: true otherwise canMint: false */
    /* add remaining badges in badgeRequired to badgeRequiredResult with isExist: false  */
    certificateOfEachOrganize.forEach((certificateOfOrganize) => {
      let certificateUserOwned: number[] = [];

      certificateOfOrganize.certificates.forEach( (certificate, index) => {

        if(certificate.badgeRequired.length === 0 && userCerTemplateCodeNotExpired.indexOf(certificate._id.toString()) === -1 ) {
          certificate.canMint = true;
        }
        else if(userCerTemplateCodeNotExpired.indexOf(certificate._id.toString()) !== -1) {
          certificateUserOwned.push(index);
        }
        else{

          certificate.badgeRequired.forEach( (badgeRemaining,index) => {
            certificate.badgeRequiredResult.push({ badgeName: badgeRemaining.name, isExist: false });
          });
          certificate.canMint = false;
        }
        /* delete badgeRequired fields */
        delete certificate.badgeRequired;

      });

      if( certificateUserOwned.length > 0 ) {
        for(let i = certificateUserOwned.length - 1; i >= 0; i--) {
          certificateOfOrganize.certificates.splice(certificateUserOwned[i], 1);
        } 
      }

    });

    return certificateOfEachOrganize;
  }

  async mintCertificate(userPublickey: string, templateCode: string) {
    /* call dependencies for minting user certificate */
    /* 1. our app wallet (server wallet)  */
    /* 2. smart contract */
    const serverWallet: Web3BaseWalletAccount = this.blockchainService.addServerWalletForSignTransaction();
    const contract: Contract<ContractABI> = this.blockchainService.getSmartContract();

    /* prepare user data for minting */
    /* 1. userPublicKey for where to mint certificate to ? [ from params ]*/
    /* 2. query certificate template for create instance of certificate */
    const certificateTemplate: Certificate = await this.findOne(templateCode);

    /* create start and expire time in unix */
    const startMillisecs: number = Date.now();
    let expireMillisecs: number = 0;

    if(
      certificateTemplate.expiration.year > 0 ||
      certificateTemplate.expiration.month > 0 ||
      certificateTemplate.expiration.day > 0
    ) {
      expireMillisecs = DateUtil.addCurrentDateWithYMDInMillisecs
      (
        certificateTemplate.expiration.year,
        certificateTemplate.expiration.month,
        certificateTemplate.expiration.day
      );
    }
    /* warn! convert to unix before send to smart contract */
    /* because smart contract use unix time */

    const userCertificate = {
      issuedBy: certificateTemplate.organizeName,
      issueUnixTime: DateUtil.millisecToUnix(startMillisecs),
      expireUnixTime: DateUtil.millisecToUnix(expireMillisecs),
      templateCode,
      badgeCriteria: certificateTemplate.badgeRequired,
    };

    /* create metadata of certificate */
    const imageBlob: ArrayBuffer | null = await this.getCertificateBlobFromImageURL(certificateTemplate.imageInfo.imageURL);

    // check err
    if(!imageBlob) {
      throw new NotFoundException('Not Found Image Blob of Badge Image.');
    }

    const metadata = await this.nftStorageClientUtils.uploadNFTMetaDataofCertificate(certificateTemplate, imageBlob);

    if(!metadata) {
      throw new BadRequestException('Can not upload metadata of nft');
    }

    try {
      await contract.methods.safeMintCertificate(
        userPublickey,
        userCertificate,
        metadata.url,
      ).send({
        from: serverWallet.address,
      });
    }catch(err) {
      throw new BadRequestException(err.innerError.message);
    }

    /* remove server account from wallet of provider */
    this.blockchainService.removeServerWalletForSignTransaction();
  }

  async getAllCerificateUser(userPublicKey: string ){
    const contract : Contract<ContractABI> = this.blockchainService.getSmartContract();
    const userPocketCertificateFromSmartContract = await contract.methods.getUserCertificatePocket(userPublicKey).call()
    const userPocketCertificate: CertifcateResp[] = await this.blockchainService.mappingCertificateFromSol(userPocketCertificateFromSmartContract); 
    
    /* filter expired Certificate out  */
    const userPocketCertificateNotExpired: CertifcateResp[] = userPocketCertificate.filter( (userCertificate) => (userCertificate.expireUnixTime > DateUtil.currentUnixTime() || Number(userCertificate.expireUnixTime) === 0 ) )
    
    console.log(userPocketCertificateNotExpired)
    /* Add data from DB w/templateCode */
    const userPocketCertificateNotExpiredMapData = await Promise.all(userPocketCertificateNotExpired.map( async (userCertificate)=>{
      const templateCertificateData : Certificate = await this.findOne(userCertificate.templateCode)
      return {
        ...templateCertificateData,
        id : Number(userCertificate.id),
        issuedBy : userCertificate.issuedBy,
        issuedDate : DateUtil.unixToDateString(Number(userCertificate.issueUnixTime)),
        expireDate : userCertificate.expireUnixTime > 0 ? DateUtil.unixToDateString(Number(userCertificate.expireUnixTime)) : "none",
      }
    }))

    /* categorize Organization */
    const userPocketCertificateNotExpiredMapDataCategorize = [];

    userPocketCertificateNotExpiredMapData.forEach((CertificateMapData)=>{
      const legnth : number = userPocketCertificateNotExpiredMapDataCategorize.length
      let isfound : boolean = false;
      let i = 0;
      while( (i < legnth) && !isfound) {
        if(CertificateMapData.issuedBy === userPocketCertificateNotExpiredMapDataCategorize[i][0].issuedBy){
          userPocketCertificateNotExpiredMapDataCategorize[i].push(CertificateMapData)
          isfound = true;
        }
        i++;
      }
      if(isfound === false){
        userPocketCertificateNotExpiredMapDataCategorize.push([CertificateMapData])
      }
    })

    console.log(userPocketCertificateNotExpiredMapDataCategorize);

    return userPocketCertificateNotExpiredMapDataCategorize
  }

  async getSpecificCertificateUser(id : string){
    const contract : Contract<ContractABI> = this.blockchainService.getSmartContract();
    let addressFromId : string 
    try{
      addressFromId = await contract.methods.ownerOf(id).call()
    }catch(error){
      throw new NotFoundException(error);
    }
    
    const userPocketCertificateFromSmartContract = await contract.methods.getUserCertificatePocket(addressFromId).call()
    const userPocketCertificate: CertifcateResp[] = await this.blockchainService.mappingCertificateFromSol(userPocketCertificateFromSmartContract); 
    const userPocketBadgeFromSmartContract = await contract.methods.getUserBadgePocket(addressFromId).call()
    const userPocketBadge: BadgeResp[] = await this.blockchainService.mappingBadgeFromSol(userPocketBadgeFromSmartContract); 
    
    /* Find Id from userPocketCertificate */
    const userPocketCertificateWithId = userPocketCertificate.filter((userCertificate)=>{
      return userCertificate.id.toString() === id;
    })
    
    /* Get CertificateTemplete */
    const certificateTemplateDB : any[] = await this.findByIdWithBadgename(userPocketCertificateWithId[0].templateCode)

    /* Add tokenId on fullBadgeRequire */
    certificateTemplateDB[0].fullBadgeRequire.forEach( async (badge)=>{
      let tokenId: number;
      let i = 0;
      while( (i < userPocketBadge.length) && !tokenId ){
        if(userPocketBadge[i].templateCode === badge._id.toString()){
          tokenId = userPocketBadge[i].id;
        }
        i++;
      }
      badge.tokenId = tokenId
    })

    /* Get User from DB */
    const userDetail = await this.userService.findByPublicKey(addressFromId.slice(2))
    if(userDetail.length === 0){
      throw new NotFoundException('user not found!');
    }

    return {
      ...certificateTemplateDB[0],
      id : userPocketCertificateWithId[0].id,
      issuedBy : userPocketCertificateWithId[0].issuedBy,
      issuedDate : DateUtil.unixToDateString(Number(userPocketCertificateWithId[0].issueUnixTime)),
      expireDate : userPocketCertificateWithId[0].expireUnixTime > 0 ? DateUtil.unixToDateString(Number(userPocketCertificateWithId[0].expireUnixTime)) : "none",
      firstName : userDetail[0].fName,
      lastName : userDetail[0].lName
    }
    
  }
}

