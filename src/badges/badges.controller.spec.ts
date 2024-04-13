import { Test, TestingModule } from '@nestjs/testing';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { BlockChainService } from 'src/blockchian.service';
import { NFTStorageClientUtil } from 'src/utils/nft-storage.util';


describe('BadgesController', () => {
  let controller: BadgesController;
  let fakeBadgeService: Partial<BadgesService>;
  let fakeBlockChainService: Partial<BlockChainService>;
  let fakeNFTStorageClientUtil: Partial<NFTStorageClientUtil>;

  beforeEach(async () => {


    fakeBadgeService = {

    };

    fakeBlockChainService = {

    };

    fakeNFTStorageClientUtil = {

    };

  const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgesController],
      providers: [
        {
          provide: BadgesService,
          useValue: fakeBadgeService
        },
        {
          provide: BlockChainService,
          useValue: fakeBlockChainService,
        },
        {
          provide: NFTStorageClientUtil,
          useValue: fakeNFTStorageClientUtil
        }
      ]
    }).compile();

    controller = module.get<BadgesController>(BadgesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
