import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrganizeGuard } from 'src/guards/organize.guard';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import { UserRole } from 'src/user/user.constant';
import { User } from 'src/user/user.entity';
import { CertificatesService } from './certificates.service';
import { CreateCertificateTemplateDto } from './dtos/create-certificate-template.dto';

@Controller('certificates')
export default class CertificatesController {

  constructor(
    private certificateService: CertificatesService
  ) {} 

  @Get('mint')
  mintBadge(
    @Query('publickey') publicKey: string, 
    @Query('templateCode') templateCode: string,
  ) {
    return this.certificateService.mintCertificate(publicKey, templateCode);
  }

  @Post('')
  @UseGuards(OrganizeGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createBadgeTemplate(
    @Body() body: CreateCertificateTemplateDto, 
    @CurrentUser(UserRole.organization) organize: User,
    @UploadedFile() image: Express.Multer.File
     ) {

    try {
      await this.certificateService.createTemplate(body, organize.id, image);
      return this.certificateService.findAll();
    }
    catch(err) {
      throw new BadRequestException(`Can not create certificate template: ${err}`);
    }

  }

  @Patch('/:id') 
  @UseGuards(OrganizeGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateBadgeTemplete(
    @Body() body: CreateCertificateTemplateDto, 
    @CurrentUser(UserRole.organization) organize: User,
    @UploadedFile() image: Express.Multer.File,
    @Param('id') id : string
    ) {
      try {
        await this.certificateService.updateTemplete(body, organize.id, image, id);
        return this.certificateService.findAll();
      }
      catch(err) {
        throw new BadRequestException(`Can not create certificate template: ${err}`);
      }
  
    }

    @Get('getAllCertificateUser')
    thirdPartyGetCertificate(
      @Query('publickey') publickKey : string
    ){
      return this.certificateService.getAllCerificateUser(publickKey);
    }
  
    @Get('getSpecificCertificateUser')
    getSpecificCertificateUser(
      @Query('id') id : string
    ){
      return this.certificateService.getSpecificCertificateUser(id);
    }

  @Get('organize')
  async getBadgeByOrganize(@Query('publickey') userPublickey : string){
    return this.certificateService.findCertificateUserCanMint(userPublickey);
  }

  @Get('/organize/:id')
  async getCertificateByOrgnizeId(@Param('id') id: string){
    return this.certificateService.findByUserId(id);
  }
  
  @Get('/organizeFullBadge/:id')
  async findByUserIdWithBadgename(@Param('id') id: string){
    return this.certificateService.findByUserIdWithBadgename(id)
  }

  @Delete('/:id')
  async deleteCertificate(@Param('id') id: string){
    return this.certificateService.remove(id);
  }
  
  // @Get('all')
  // async getAllBadges(){
  //   return this.certificateService.findAll();
  // }

  @Get('/:id')
  async getCertificateById(@Param('id') id: string){
    return this.certificateService.findOne(id)
  }

} 
