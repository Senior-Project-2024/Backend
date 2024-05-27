import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { resolve } from 'path';
import { AppModule } from './app.module';
import { BadgesModule } from './badges/badges.module';
import { UserModule } from './user/user.module';

async function bootstrap() {
  // const app = await NestFactory.create(AppModule);
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type,Authorization,Set-Cookie',
    credentials: true, 
  });

  const appConfig = new DocumentBuilder()
    .setTitle('Proveself API')
    .setDescription('All api existing in our Proveself Application')
    .setVersion('1.0')
    .addTag('Proveself')
    .build();

  const thirdPartyConfig = new DocumentBuilder()
    .setTitle('ThirdParty API')
    .setDescription('Dear our organization you can read how each api work below. have fun !!!')
    .setVersion('1.0')
    .addTag('ThirdParty')
    .addSecurity(
      'api-token',
      {
        type: 'apiKey',
        description: 'Token from api token pages',
        name: 'api-token',
        in: 'headers',
      },
    )
    .build();

  const document = SwaggerModule.createDocument(app, appConfig);
  const thirdPartyConfigDoc = SwaggerModule.createDocument(app, thirdPartyConfig, {
    include: [UserModule, BadgesModule],    
  });
  
  if(process.env.NODE_ENV === 'development') {
    SwaggerModule.setup('swagger-app', app, document);
    SwaggerModule.setup('swagger-third-party', app, thirdPartyConfigDoc, { url: 'swagger-third-json' });
  }

  app.set('trust proxy', 1);

  app.useStaticAssets(resolve('./public'));
  app.setBaseViewsDir(resolve('./views'));
  app.setViewEngine('hbs');
  
  await app.listen(4000);
}

bootstrap();
