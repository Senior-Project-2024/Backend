import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { randomBytes, scrypt as _scrpyt } from 'crypto';
import { promisify } from 'util';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserSignInRespDto } from './dtos/user-sign-in-resp.dto';
import { CreateTokenApiRespDto } from './dtos/create-token-api-resp.dto';
import { Web3App } from 'src/utils/web3.util';
import { Web3Account } from 'web3-eth-accounts';
import { KeyStore } from 'web3';
import { Crypto } from '../utils/crypto.util';

const scrypt = promisify(_scrpyt);

@Injectable()
export class AuthService {
  
  constructor(
    private userService: UserService,
    private crypto: Crypto
    ) {}
  
  async signUp(userDto: CreateUserDto): Promise<User> {
    //1. check email and telNo is exist in db ? 
    const [userDb] = await this.userService.find(userDto.email);

    if(userDb) {
      throw new BadRequestException('email already in use!.');
    }

    const [userByTelNo] = await this.userService.findByTelNo(userDto.telNo);

    if(userByTelNo) {
      throw new BadRequestException('telNo already in use!.');
    }

    //2. hash password
    // generate salt
    const salt = randomBytes(8).toString('hex');
    // hash password
    const hashPassword = (await scrypt(userDto.password, salt, 32)) as Buffer;

    const hashAndSalt = salt + '.' + hashPassword.toString('hex');

    //3. create eth wallet for new user
    const web3 = Web3App.getInstance();
    const ethWallet: Web3Account = web3.eth.accounts.create();

    // encrypt eth wallet with actual password
    const encryptedEthWallet: KeyStore = await web3.eth.accounts.encrypt(
      ethWallet.privateKey, 
      userDto.password
    );

    //4. create and save user into db
    const user: User = await this.userService.create(
      {...userDto, password: hashAndSalt}, 
      encryptedEthWallet
    );

    //5. send user data back
    return { ...user, id: user.id.toString() };
  }
  
  async signIn(email: string, password: string): Promise<UserSignInRespDto> {
    //1. find user is exist in db ?
    const [user] = await this.userService.find(email);

    if(!user) {
      throw new NotFoundException('user not found!.');
    }

    //2. get salt from db
    const [salt, hashPassword] = user.password.split('.');

    //3. use salt in db for generate hashPassword that use password in request
    const hashPasswordFromRequest = (await scrypt(password, salt, 32)) as Buffer;

    //4. compare hasPasswordFromRequest and hashPasswordFromDatabase
    if(hashPasswordFromRequest.toString('hex') !== hashPassword) {
      throw new BadRequestException('bad password');
    }

    //5. decrypt eth wallet
    const web = Web3App.getInstance();
    const ethWallet: Web3Account = await web.eth.accounts.decrypt(JSON.stringify(user.keyStoreJsonV3), password);

    //6. return result 
    return { ...user, id: user.id.toString() , ethWallet};
  }

  async generateTokenApi(id: string): Promise<CreateTokenApiRespDto> {
    
    // encrypt userId with TOKEN_API_KEY
    const tokenApi: string = this.crypto.encryptAES256( id.toString(), 'TOKEN_API_KEY', 'AES256_GCM');

    // encryptTokenApi with app_key
    const encryptedTokenApi: string = this.crypto.encryptAES256( tokenApi, 'AES256_GCM_KEY', 'AES256_GCM');

    // update encryptTokenApi in database
    this.userService.update(id, { tokenApi: encryptedTokenApi });

    return {id, tokenApi}; 
  }

  async verifyTokenApi(tokenApi: string): Promise<boolean> {

    const userId: string = this.crypto.decryptAES256(tokenApi, 'TOKEN_API_KEY', 'AES256_GCM');

    const user: User = await this.userService.findOne(userId);

    if(!user) {
      return false;
    }

    const decryptedTokenApi: string = this.crypto.decryptAES256(
      user.tokenApi, 'AES256_GCM_KEY', 'AES256_GCM'
      );

    if(decryptedTokenApi !== tokenApi ) {
      return false;
    }

    return true;
  }
  
  
}