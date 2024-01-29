import { RegisteredSubscription } from 'web3/lib/commonjs/eth.exports';
import { Web3 } from 'web3';

export class Web3App {

  private static instance: Web3<RegisteredSubscription> | null = null;

  static getInstance(): Web3<RegisteredSubscription> {

    if(!Web3App.instance) {
      Web3App.instance = new Web3('https://sepolia.infura.io/v3/04d0f797d0d94fa7a36a6325f9200ef6');
    }

    return Web3App.instance;
  }
  
}