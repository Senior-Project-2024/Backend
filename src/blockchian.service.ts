import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Contract, Web3BaseWalletAccount } from 'web3';
import { Web3App } from './utils/web3.util';
import { contractABI, ContractABI } from 'src/utils/smart-contract/contractABI';
import { Web3Account } from 'web3-eth-accounts';

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
}
