import { KeyStore, Transaction } from 'web3';
import { Expose } from 'class-transformer';

export class EthWallet{

  @Expose()
  address: string;

  privateKey: string;

  encrypt: (password: string, options?: Record<string, unknown>) => Promise<KeyStore>;

  sign: (data: string | Record<string, unknown>) => { readonly messageHash: string; readonly r: string; readonly s: string; readonly v: string; readonly message?: string; readonly signature: string; };

  signTransaction: (tx: Transaction) => Promise<{ readonly messageHash: string; readonly r: string; readonly s: string; readonly v: string; readonly rawTransaction: string; readonly transactionHash: string; }>;
  
}