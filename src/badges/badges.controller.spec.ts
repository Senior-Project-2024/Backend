import { Test, TestingModule } from '@nestjs/testing';
import { BadgesController } from './badges.controller';
import { BadgesService } from './badges.service';
import { AuthService } from 'src/user/auth.service';

describe('BadgesController', () => {
  let controller: BadgesController;
  let fakeBadgeService: Partial<BadgesService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {


    fakeBadgeService = {

    };

    fakeAuthService = {

    };

  const module: TestingModule = await Test.createTestingModule({
      controllers: [BadgesController],
      providers: [
        {
          provide: BadgesService,
          useValue: fakeBadgeService
        },
        {
          provide: AuthService,
          useValue: fakeAuthService
        }
      ]
    }).compile();

    controller = module.get<BadgesController>(BadgesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
