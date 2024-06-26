import { Module, MiddlewareConsumer } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from './user.entity';
import { AuthService } from './auth.service'; 
import { CryptoUtil } from 'src/utils/crypto.util';
import { CurrentUserMiddleware } from './middlewares/current-user.middleware';
import { BlockChainService } from 'src/blockchian.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [
    UserService,
    AuthService,
    CryptoUtil,
    BlockChainService
  ],
  exports: [
    UserService,
    AuthService,
    CryptoUtil
  ]
})
export class UserModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CurrentUserMiddleware).forRoutes('*');
  }
}
