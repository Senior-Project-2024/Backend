import { Test, TestingModule } from '@nestjs/testing';
import { BadgesService } from './badges.service';
import { BlockChainService } from 'src/blockchian.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { NFTStorageClientUtil } from 'src/utils/nft-storage.util';
import { HttpService } from '@nestjs/axios';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Badge } from './badges.entity';
import { User } from '../user/user.entity';
import { MongoRepository } from 'typeorm';
import { UserService } from 'src/user/user.service';
import { CertificatesService } from 'src/certificates/certificates.service';

describe('BadgesService', () => {
  let service: BadgesService;
  let fakeUserService: Partial<User>;
  let fakeBlockChainService: Partial<BlockChainService>;
  let fakeCloudinaryService: Partial<CloudinaryService>;
  let fakeHttpService: Partial<HttpService>;
  let fakenftStorageClientService: Partial<NFTStorageClientUtil>;
  let fakeCertificateService: Partial<CertificatesService>;
  let badgeRepositoyry: MongoRepository<Badge>;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BadgesService,
        {
          provide: UserService,
          useValue: fakeUserService
        },
        {
          provide: BlockChainService,
          useValue: fakeBlockChainService,
        },
        {
          provide: CloudinaryService,
          useValue: fakeCloudinaryService,
        },
        {
          provide: HttpService,
          useValue: fakeHttpService,
        },
        {
          provide: NFTStorageClientUtil,
          useValue: fakenftStorageClientService,
        },
        {
          provide: CertificatesService,
          useValue: fakeCertificateService,
        },
        {
          provide: getRepositoryToken(Badge),
          useValue: {
            create: jest.fn(),
            save: jest.fn()
          }
        }
      ],
    }).compile();

    service = module.get<BadgesService>(BadgesService);
    badgeRepositoyry = module.get<MongoRepository<Badge>>(getRepositoryToken(Badge));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

/*     private blockchainService: BlockChainService,
    private cloudinaryService: CloudinaryService,
    private httpService: HttpService,
    private nftStorageClientUtils: NFTStorageClientUtil, */