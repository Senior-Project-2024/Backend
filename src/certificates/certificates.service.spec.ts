import { HttpService } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BlockChainService } from 'src/blockchian.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { NFTStorageClientUtil } from 'src/utils/nft-storage.util';
import { MongoRepository } from 'typeorm';
import { Certificate } from './certificates.entity';
import { CertificatesService } from './certificates.service';
import { UserService } from 'src/user/user.service';

describe('CertificatesService', () => {
  let service: CertificatesService;
  let fakeUserService: Partial<UserService>;
  let fakeBlockChainService: Partial<BlockChainService>;
  let fakeNftStorageClientUtils: Partial<NFTStorageClientUtil>;
  let fakeHttpService: Partial<HttpService>;
  let fakeCloudinaryService: Partial<CloudinaryService>;
  let certificateRepo: Partial<MongoRepository<Certificate>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CertificatesService,
        {
          provide: UserService,
          useValue: fakeUserService,
        },
        {
          provide: BlockChainService,
          useValue: fakeBlockChainService,
        },
        {
          provide: NFTStorageClientUtil,
          useValue: fakeNftStorageClientUtils,
        },
        {
          provide: HttpService,
          useValue: fakeHttpService,
        },
        {
          provide: CloudinaryService,
          useValue: fakeCloudinaryService,
        },
        {
          provide: getRepositoryToken(Certificate),
          useValue: {
            create: jest.fn(),
            save: jest.fn()
          },
        },
      ],
    }).compile();

    service = module.get<CertificatesService>(CertificatesService);
    certificateRepo = module.get<MongoRepository<Certificate>>(getRepositoryToken(Certificate));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
