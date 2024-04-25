import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { NotFoundException, Session } from '@nestjs/common';
import { userMock1 } from './user.entity.mock';
import { BlockChainService } from 'src/blockchian.service';
import { CryptoUtil } from 'src/utils/crypto.util';

describe('UserController', () => {
  let controller: UserController;
  let fakeUserService: Partial<UserService>;
  let fakeAuthService: Partial<AuthService>;
  let fakeBlockChainService: Partial<BlockChainService>;
  let fakeCryptoUtil: Partial<CryptoUtil>;

  beforeEach(async () => {

    fakeUserService = {
      find: (email: string) => {
        return Promise.resolve([ { ...userMock1, email } ]);
      },
      findOne: (id: string) => {
        return Promise.resolve( { ...userMock1, id } ); 
      },
      // remove: (id: number) => {},
      // update: () => {}
    }

    fakeAuthService = {
      signIn: (email: string, password: string ) => {
        return Promise.resolve( { ...userMock1, email, password, ethWallet: null } );
      },
      // signUp: () => {}
    }


    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: fakeUserService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
        {
          provide: BlockChainService,
          useValue: fakeBlockChainService,
        },
        {
          provide: CryptoUtil,
          useValue: fakeCryptoUtil,
        },
      ]
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUser return a list of users with the given email', async () => {
    const user = await controller.findAllUsers('test@test.com');
    expect(user.length).toEqual(1);
    expect(user[0].email).toEqual('test@test.com');
  });

  it('findUser return user with the given id', async () => {
    const user = await controller.findUser('1');
    expect(user).toBeDefined();
    expect(user.id).toEqual("1");
  });

  it('signin updates session object and return user.', async () => {
    let session = { 
      organizeId: ""
    };

    let user = await controller.signIn(
      { email: 'test@test.com', password: 'test'},
      session,
    )

    expect(user).toBeDefined();
    expect(user.id).toEqual("1");
    expect(session.organizeId).toEqual("1");
  });


});
