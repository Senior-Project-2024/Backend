import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MongoRepository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

describe('UserService', () => {
  let service: UserService;
  let userRepo: MongoRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepo = module.get<MongoRepository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
