import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlockChainService } from 'src/blockchian.service';
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

@Injectable()
export class CertificatesService {
  
  constructor(
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

    return this.certificateRepo.find( { where: { userId } } );
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
    const expireMillisecs: number = DateUtil.addCurrentDateWithYMDInMillisecs
    (
      certificateTemplate.expiration.year,
      certificateTemplate.expiration.month,
      certificateTemplate.expiration.day
    );
    /* warn! convert to unix before send to smart contract */
    /* because smart contract use unix time */

    const userCertificate = {
      issuedBy: certificateTemplate.name,
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
}
