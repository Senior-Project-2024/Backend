import { RegisteredSubscription } from 'web3/lib/commonjs/eth.exports';
import { Web3, Web3BaseWalletAccount, Web3Validator, KeyStore } from 'web3';
import { ConfigService } from '@nestjs/config';
import { Wallet, Web3Account } from 'web3-eth-accounts';

export class Web3App {

  private static instance: Web3<RegisteredSubscription> | null = null;

  static getInstance(): Web3<RegisteredSubscription> {

    if(!Web3App.instance) {
      Web3App.instance = new Web3('https://sepolia.infura.io/v3/04d0f797d0d94fa7a36a6325f9200ef6');
    }

    return Web3App.instance;
  }

  static addWalletForSignTransaction(privateKey: string): Web3BaseWalletAccount{

    // get server wallet private key for signing transaction
    const privateKeyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`
    const web3Account = Web3App.getInstance().eth.accounts.privateKeyToAccount(privateKeyWithPrefix);

    const account: Wallet<Web3BaseWalletAccount> = Web3App.getInstance().eth.accounts.wallet.add(web3Account);
    
    return account[0];
  }

  static removeWalletForSignTransaction(address: string) : Boolean{

    // get server wallet private key for signing transaction
    const addressWithPrefix = address.startsWith('0x') ? address : `0x${address}`

    return Web3App.getInstance().eth.accounts.wallet.remove(addressWithPrefix);
  }

  static getAccountFromPrivateKey(privateKey: string): Web3Account {
    const privateKeyWithPrefix = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`

    return Web3App.getInstance().eth.accounts.privateKeyToAccount(privateKeyWithPrefix);
  }

  static async changePasswordToEncryptedWallet(oldPassword: string, newPassword: string, keyStoreJsonV3: KeyStore): Promise<KeyStore> {
    const wallet = await Web3App.getInstance().eth.accounts.decrypt(JSON.stringify(keyStoreJsonV3), oldPassword);

    return Web3App.getInstance().eth.accounts.encrypt(wallet.privateKey, newPassword);
  } 
  
}