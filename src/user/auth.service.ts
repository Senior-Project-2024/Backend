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
import { CryptoUtil } from '../utils/crypto.util';
import { UserRole } from './user.constant';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { IAppSession } from 'src/utils/interfaces/app-session.interface';

const scrypt = promisify(_scrpyt);

@Injectable()
export class AuthService {
  
  constructor(
    private userService: UserService,
    private crypto: CryptoUtil,
    private readonly configService: ConfigService
    ) {}
  
  async signUp(userDto: CreateUserDto): Promise<User> {
    //1. check email and telNo is exist in db ? 
    const [userDb] = await this.userService.find(userDto.email);

    if(userDb) {
      throw new BadRequestException('email already in use!.');
    }

    if(userDto.role == UserRole.user){
      const [userByTelNo] = await this.userService.findByTelNo(userDto.telNo);
      if(userByTelNo){
        throw new BadRequestException('telNo already in use!.');
      }
    }

    if(userDto.role == UserRole.organization) {
      const [userByLandlineNumber] = await this.userService.findByLandlineNumber(userDto.landlineNumber);
      // console.log(userByLandlineNumber)
      if(userByLandlineNumber){
        throw new BadRequestException('LandlineNumber already in use!.');
      }
    }

    //2. hash password
    const hashAndSalt: string = await this.hashPassword(userDto.password);

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
    // find user is exist in db ?
    const [user] = await this.userService.find(email);

    if(!user) {
      throw new NotFoundException('Email not found.');
    }

    // check Confirmation email
    if(!user.isConfirm) {
      throw new BadRequestException('Your email is not verified');
    }

    // check password match ? 
    await this.checkPasswordMatch(password, user.password);

    // decrypt eth wallet
    const web = Web3App.getInstance();
    const ethWallet: Web3Account = await web.eth.accounts.decrypt(JSON.stringify(user.keyStoreJsonV3), password);

    // return result 
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

  async sendEmail(email : string){
    // create transporter
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>("MAIL_HOST"),
      port: this.configService.get<number>("MAIL_PORT"),
      secure: true,
      auth: {
        user: this.configService.get<string>("MAIL_USER"),
        pass: this.configService.get<string>("MAIL_PASSWORD")
      }
    });
    
    const timestamp : Date = new Date();
    const hashCode = this.crypto.getSHA256(email, "hex");
    const user = await this.userService.findByEmailAndUpdateHashCode(email, hashCode);
    // timeStamp will be string and will be set GMT+7 already
    const link = this.configService.get<string>("HOST") + "/auth/confirmEmail?hashCode=" + hashCode ;
    try{
      await transporter.sendMail({
        from: {name : "ProveSelf" , address : "pathinya19@gmail.com"}, // sender address
        to: [{name : user.fName + " " + user.lName , address : email}], // list of receivers
        subject: "Hello ✔", // Subject line
        text: "Hello world?", // plain text body
        html: `<!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Type" content="text/html charset=UTF-8" />
          <title>Document</title>
          <style>
            .head{
              width: 100%;
              display: flex;
              flex-direction: column;
              margin-top: 30px;
            }
            .header{
              font-size: 24px;
            }
            .text20{
              font-size: 20px;
            }
            .text18{
              font-size: 18px;
            }
            .maginAuto{
              display: block;
              margin-left: auto;
              margin-right: auto;
              text-align: center;
            }
            .mt30{
              margin-top: 30px;
            }
            
          </style>
        </head>
        <body>
          <a href="https://imgbb.com/" class="maginAuto mt30"><img src="https://i.ibb.co/q0kyqkk/logo.png" alt="logo" border="0" /></a>
          <p class="header maginAuto">Hello! Pathinya Jongupangpan</p>
          <p class="text18 maginAuto">To activate your account, please click on the link below to verify your email address</p>
          <a href=${link} target="_blank" class="maginAuto">${link}</a>
        </body>
        </html>
        `, 
      });
      return timestamp.getTime();

    }catch(error){
      throw new BadRequestException('sending email fail');
    }
  }
  
  async confirmEmail(hashCode :string, timeStamp :number ){
    type ItypeConfirm = "default" | "success" | "fail";
    let typeConfirm : ItypeConfirm = "success";
    const currentTime = new Date();
    // 1. check hash in db
    const user = await this.userService.findByHashCode(hashCode);

    // 1.5 check if confirm email already
    if(user.isConfirm){
      if(user.role == "user"){
        return { "url": this.configService.get<string>("CLIENT_HOST") + "/signin"}
      }else{
        return { "url": this.configService.get<string>("CLIENT_HOST") + "organization/signin"}
      }
    }
    
    // 2. check that time different more 5 minute?
    if(currentTime.getTime() - timeStamp > 1000*60*5 ){
      typeConfirm = "fail";
      return { "url": this.configService.get<string>("CLIENT_HOST") + "/signin?email=" + user.email + "&typeConfirm=" + typeConfirm }
    }

    // 3. Update status isConfirm
    await this.userService.findHashCodeAndUpdateIsConfirm(hashCode)

    // 4. check role for specific route
    if(user.role == "user"){
      return { "url": this.configService.get<string>("CLIENT_HOST") + "/signin?email=" + user.email + "&typeConfirm=" + typeConfirm }
    }else{
      return { "url": this.configService.get<string>("CLIENT_HOST") + "organization/signin?email=" + user.email + "&typeConfirm=" + typeConfirm }
    }
  }

  async checkPasswordMatch(passwordFromRequest: string, passwordFromDb: string) {

    // get salt from db 
    const [salt, hashPassword] = passwordFromDb.split('.');

    // use salt in db for generate hashPassword that use password in request
    const hashPasswordFromRequest = (await scrypt(passwordFromRequest, salt, 32)) as Buffer;

    // compare hasPasswordFromRequest and hashPasswordFromDatabase
    if(hashPasswordFromRequest.toString('hex') !== hashPassword) {
      throw new BadRequestException('Your password is wrong');
    }

  }

  async hashPassword(passwordToHashed: string): Promise<string> {
    /* hash password */
    // generate salt
    const salt = randomBytes(8).toString('hex');
    // hash password
    const hashPassword = (await scrypt(passwordToHashed, salt, 32)) as Buffer;

    return salt + '.' + hashPassword.toString('hex');
  }

}