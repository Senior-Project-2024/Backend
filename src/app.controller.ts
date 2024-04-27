import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { VerifyNFTResp } from './dtos/verify-nft-resp.dto';
import { Serialize } from './interceptor/serializer.interceptor';

@Controller('')
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('verify/:id') 
  @Serialize(VerifyNFTResp)
  async verifyNFTFromSmartContract(@Param('id') tokenIdString: string) {
    const tokenIdNumber: number = Number(tokenIdString);

    if(!tokenIdNumber) {
      throw new BadRequestException('tokenId is not number!.');
    }

    return this.appService.getNFTFromSmartContractById(tokenIdNumber);
  }
}
