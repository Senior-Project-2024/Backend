import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { randomBytes, scrypt as _scrpyt } from 'crypto';
import { promisify } from 'util';
import { User } from './user.entity';

const scrypt = promisify(_scrpyt);

@Injectable()
export class AuthService {
  
  constructor(private userService: UserService) {}
  
  async signUp(email: string, password: string) {
    //1. check email is exist in db ? 
    const [dbEmail] = await this.userService.find(email);

    if(dbEmail) {
      throw new BadRequestException('email already in use!.');
    }

    //2. hash password
    // generate salt
    const salt = randomBytes(8).toString('hex');
    // hash password
    const hashPassword = (await scrypt(password, salt, 32)) as Buffer;

    const result = salt + '.' + hashPassword.toString('hex');

    //3. create and save user into db
    const user: User = await this.userService.create(email,result);

    //4. send user data back
    return user;
  }
  
  async signIn(email: string, password: string) {
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
    //5. return result 
    if(hashPasswordFromRequest.toString('hex') !== hashPassword) {
      throw new BadRequestException('bad password');
    }
    
    return user;
  }
  
}