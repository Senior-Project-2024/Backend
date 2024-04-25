import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { KeyStore } from 'web3';
import { ObjectId } from 'mongodb';
import { CryptoUtil } from 'src/utils/crypto.util';
import { ConfigService } from '@nestjs/config';


describe('AuthService', () => {

  let service: AuthService;
  let fakeUserService: Partial<UserService>;
  let fakeCryptoUtil: Partial<CryptoUtil>;
  let fakeConfigService: Partial<ConfigService>;


  beforeEach(async () => {
    
    let users: User[] = [];

    fakeUserService = {
      find: (email: string) => {
        const user = users.filter((user) => user.email === email);
        return Promise.resolve(user); 
      },
      create: (userDto: CreateUserDto, keyStoreJsonV3: KeyStore) => {
        const newUser: User = { id: 'testId', ...userDto, isConfirm: false, hashCode : "", keyStoreJsonV3, tokenApi: ""};
        users.push(newUser);
        return Promise.resolve(newUser);
      }
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { 
          provide: UserService,
          useValue: fakeUserService
        },
        { 
          provide: CryptoUtil,
          useValue: fakeCryptoUtil
        },
        { 
          provide: ConfigService,
          useValue: fakeUserService
        },
      ]
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  // it('create new user with a salted and hashed passoword', async () => {
  //   const user = await service.signUp('party@mail.com', 'party');

  //   expect(user.password).not.toEqual('party');
  //   const [salted, hash] = user.password.split('.');
  //   expect(salted).toBeDefined();
  //   expect(hash).toBeDefined();
  // });

  // it('throws an error if user signs up with email that is in use', async () => {
  //   await service.signUp('test@mail.com', 'test');

  //   await expect(service.signUp('test@mail.com', 'test'))
  //   .rejects.toThrow(BadRequestException);

  // });

  // it('throws an error if user sign in with email not used', async () => {
  //   await expect(service.signIn('test@mail.com', 'test'))
  //   .rejects.toThrow(NotFoundException);
  // });

  // it('throws an error if password from user not match with password in db', async () => {
  //   await service.signUp('test@test.com', 'test');
    
  //   await expect(service.signIn('test@test.com', 'test123'))
  //   .rejects.toThrow(BadRequestException);
  // });

});