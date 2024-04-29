import { Module, ValidationPipe, MiddlewareConsumer } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm'
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { User } from './user/user.entity';
import { BadgesModule } from './badges/badges.module';
import { CertificatesModule } from './certificates/certificates.module';
import { Badge } from './badges/badges.entity';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { Certificate } from './certificates/certificates.entity';
import { BlockChainService } from './blockchian.service';
const cookieSession = require('cookie-session');

@Module({
  imports: [
    ConfigModule.forRoot({
       isGlobal: true,
       envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mongodb',
          url: config.get<string>('DB_URI'),
          database: config.get<string>('DB_NAME'),
          synchronize: true,
          entities: [User, Badge, Certificate],
        };
      }
    }),
    UserModule,
    BadgesModule,
    CertificatesModule,
    CloudinaryModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true,
      }),
    },
    BlockChainService
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(
      cookieSession({
        keys: ['asdasdasd'],
        sameSite: 'lax',
        secure: false,
        domain: 'localhost' 
      })
    )
    .forRoutes('*');
  }
}
