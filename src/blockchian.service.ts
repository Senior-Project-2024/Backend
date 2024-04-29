import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ContractABI, contractABI } from 'src/utils/smart-contract/contractABI';
import { Contract, KeyStore, Web3BaseWalletAccount } from 'web3';
import { Web3Account } from 'web3-eth-accounts';
import { Web3App } from './utils/web3.util';

export type BadgeResp = {
  id: number;
  issuedBy: string;
  issueUnixTime: bigint;
  expireUnixTime: bigint;
  templateCode: string;
  evidenceURL: string;
}

export type CertifcateResp = {
  id: number;
  issuedBy: string;
  issueUnixTime: bigint;
  expireUnixTime: bigint;
  templateCode: string;
  badgeCriteria: string[];
}

export type BadgeStructOutput = [
  id: bigint,
  issuedBy: string,
  issueUnixTime: bigint,
  expireUnixTime: bigint,
  templateCode: string,
  evidenceURL: string
] & {
  id: bigint;
  issuedBy: string;
  issueUnixTime: bigint;
  expireUnixTime: bigint;
  templateCode: string;
  evidenceURL: string;
};

export type CertificateStructOutput = [
  id: bigint,
  issuedBy: string,
  issueUnixTime: bigint,
  expireUnixTime: bigint,
  templateCode: string,
  badgeCriteria: string[]
] & {
  id: bigint;
  issuedBy: string;
  issueUnixTime: bigint;
  expireUnixTime: bigint;
  templateCode: string;
  badgeCriteria: string[];
};

@Injectable()
export class BlockChainService {

  constructor(
    private configService: ConfigService
  ) {}

  addServerWalletForSignTransaction(): Web3BaseWalletAccount {
    // get server wallet private key for signing transaction
    const privateKey: string = this.configService.get<string>('WALLET_PRIVATE_KEY');
    return Web3App.addWalletForSignTransaction(privateKey);
  }

  removeServerWalletForSignTransaction(): Boolean {
    // get server wallet private key for signing transaction
    const address: string = this.configService.get<string>('WALLET_PUBLIC_KEY');
    return Web3App.removeWalletForSignTransaction(address);
  }

  getSmartContract(): Contract<ContractABI> {

      // call instance for web3
      const web3 = Web3App.getInstance();

      // get contract info for create instance of contract
      const contractAddress: string = this.configService.get<string>('CONTRACT_ADDRESS');
      return new web3.eth.Contract(contractABI as ContractABI, contractAddress);
  }

  getWalletByPrivateKey(privateKey: string): Web3Account {
    return Web3App.getAccountFromPrivateKey(privateKey);
  }

  async changePasswordEncryptedWallet(oldPassword: string, newPassword: string, keyStoreJsonV3: KeyStore) {
    return Web3App.changePasswordToEncryptedWallet(oldPassword, newPassword, keyStoreJsonV3);
  }
  
  async mappingBadgeFromSol(badgeFromContract: any[]): Promise<BadgeResp[]>{
    let newBadge: BadgeResp[] = [];

    for(let badge of badgeFromContract) {

      let newStructBadge: BadgeResp = {
        id: Number(badge[0]),
        issuedBy: badge[1],
        issueUnixTime: badge[2],
        expireUnixTime: badge[3],
        templateCode: badge[4],
        evidenceURL: badge[5]
      };

      newBadge.push(newStructBadge);
    }

    return newBadge;
  }

  async mappingCertificateFromSol(certificateFromContract: any[]): Promise<CertifcateResp[]> {

    let newCertificate: CertifcateResp[] = [];

    for(let certificate of certificateFromContract) {

      let newStructBadge: CertifcateResp = {
        id: Number(certificate[0]),
        issuedBy: certificate[1],
        issueUnixTime: certificate[2],
        expireUnixTime: certificate[3],
        templateCode: certificate[4],
        badgeCriteria: certificate[5],
      };

      newCertificate.push(newStructBadge);
    }

    return newCertificate;
  }


}
