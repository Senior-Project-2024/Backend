import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractABI } from 'src/utils/smart-contract/contractABI';
import { Contract } from 'web3';
import { Badge } from './badges/badges.entity';
import { BadgesService } from './badges/badges.service';
import { Certificate } from './certificates/certificates.entity';
import { CertificatesService } from './certificates/certificates.service';
import { User } from './user/user.entity';
import { UserService } from './user/user.service';
import { DateUtil } from './utils/date.util';
import { 
  BadgeStructOutput, 
  CertificateStructOutput, 
  BadgeResp, 
  CertifcateResp, 
  BlockChainService
} from './blockchian.service';

@Injectable()
export class AppService {

  constructor(
    private certificateService: CertificatesService,
    private badgeService: BadgesService,
    private userService: UserService,
    private blockchainService: BlockChainService
  ){}

  getHello(): string {
    return 'Hello World!';
  }

  async getNFTFromSmartContractById(tokenId: number) {
    const contract: Contract<ContractABI> = this.blockchainService.getSmartContract();
    
    const address: string = await contract.methods.ownerOf(tokenId).call();

    if(!address) {
      throw new NotFoundException('Token Id not found!.');
    }
    
    const user: User = (await this.userService.findByPublicKey(address.slice(2)))[0];

    if(!user) {
      throw new NotFoundException('User not found!.');
    }

    const userBadgeFromSmartContract: BadgeStructOutput[] = await contract.methods.getUserBadgePocket(address).call();
    const userCertificateFromSmartContract: CertificateStructOutput[] = await contract.methods.getUserCertificatePocket(address).call();

    const userBadge: BadgeResp[] = await this.blockchainService.mappingBadgeFromSol(userBadgeFromSmartContract);
    const userCertificate: CertifcateResp[] = await this.blockchainService.mappingCertificateFromSol(userCertificateFromSmartContract);

    let tokenResult: BadgeResp | CertifcateResp = null;

    userBadge.forEach( (badge) => {

      if(badge.id === tokenId) {
        tokenResult = badge;
      }

    });

    if(!tokenResult.id) { // certificate
      userCertificate.forEach( (certificate) => {

        if(certificate.id === tokenId) {
          tokenResult = certificate;
        }

      });

      const certificateFromDb: Certificate = await this.certificateService.findWithIdAndLinkCollection(tokenResult.templateCode);

      const issueDateConverter: string[] = DateUtil.unixToDate(tokenResult.issueUnixTime).toUTCString().split(' ');
      let expireDateConverter: string[];

      if( Number(tokenResult.expireUnixTime) !== 0 ) {
        expireDateConverter = DateUtil.unixToDate(tokenResult.expireUnixTime).toUTCString().split(' '); // dd mm yy
      }
      console.log('here')
      
      return { 
        ...certificateFromDb,
        issuedTo: `${user.fName} ${user.lName}`,
        issueBy: tokenResult.issuedBy, 
        issueDate: `${issueDateConverter[1]} ${issueDateConverter[2]} ${issueDateConverter[3]}`,
        expiredDate: Number(tokenResult.expireUnixTime) === 0 ? null : `${expireDateConverter[1]} ${expireDateConverter[2]} ${expireDateConverter[3]}`,
      }

    }else { // badge
      const badgeFromDb: Badge = await this.badgeService.findOne(tokenResult.templateCode);

      const issueDateConverter: string[] = DateUtil.unixToDate(tokenResult.issueUnixTime).toUTCString().split(' ');
      let expireDateConverter: string[];


      if( Number(tokenResult.expireUnixTime) !== 0 ) {
        expireDateConverter = DateUtil.unixToDate(tokenResult.expireUnixTime).toUTCString().split(' ');
      }
      
      return { 
        ...badgeFromDb,
        issuedTo: `${user.fName} ${user.lName}`,
        issueBy: tokenResult.issuedBy, 
        issueDate: `${issueDateConverter[1]} ${issueDateConverter[2]} ${issueDateConverter[3]}`,
        expiredDate: Number(tokenResult.expireUnixTime) === 0 ? null : `${expireDateConverter[1]} ${expireDateConverter[2]} ${expireDateConverter[3]}`,
      }
    }

  }
}
