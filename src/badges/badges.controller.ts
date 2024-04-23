import { BadRequestException, Body, Controller, Post, UseGuards, Get, Query, UseInterceptors, UploadedFile, Session, Param, Patch } from '@nestjs/common';
import { CreateBadgeTemplateDto } from './dtos/create-badge-template.dto';
import { ThirdPartyGuard } from 'src/guards/third-party.guard';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import { User } from 'src/user/user.entity';
import { HostGuard } from 'src/guards/host.guard';
import { BadgesService } from './badges.service';
import { OrganizeGuard } from 'src/guards/organize.guard';
import { UserRole } from 'src/user/user.constant';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpService } from '@nestjs/axios';
import { IAppSession } from 'src/utils/interfaces/app-session.interface';

@Controller('badges')
export class BadgesController {

  constructor(
    private badgeService: BadgesService,
    // private httpService: HttpService
  ){} 

  @Get('mint')
  @UseGuards(ThirdPartyGuard)
  mintBadge(
    @Query('publickey') publicKey: string, 
    @Query('templateCode') templateCode: string,
    @Query('evidenceURL') evidenceURL: string,
  ) {
    return this.badgeService.mintBadge(publicKey, templateCode, evidenceURL);
  }

  @Post('')
  @UseGuards(OrganizeGuard)
  @UseInterceptors(FileInterceptor('image'))
  async createBadgeTemplate(
    @Body() body: CreateBadgeTemplateDto, 
    @CurrentUser(UserRole.organization) organize: User,
    @UploadedFile() image: Express.Multer.File
     ) {

    try {
      await this.badgeService.createTemplate(body, organize.id, image);
      return this.badgeService.findAll();
    }
    catch(err) {
      throw new BadRequestException(`Can not create badge template: ${err}`);
    }

  }

  @Patch('/:id') 
  @UseGuards(OrganizeGuard)
  @UseInterceptors(FileInterceptor('image'))
  async updateBadgeTemplete(
    @Body() body: CreateBadgeTemplateDto, 
    @CurrentUser(UserRole.organization) organize: User,
    @UploadedFile() image: Express.Multer.File,
    @Param('id') id : string
    ) {
      try {
        await this.badgeService.updateTemplete(body, organize.id, image, id);
        return this.badgeService.findAll();
      }
      catch(err) {
        throw new BadRequestException(`Can not create badge template: ${err}`);
      }
  
    }

  @Get('all')
  async getAllBadges(){
    return this.badgeService.findAll();
  }

  @Get('/organize/:id')
  async getBadgeByOrgnizeId(@Param('id') id: string){
    return this.badgeService.findByUserId(id)
  }

  @Get('/:id')
  async getBadgeById(@Param('id') id: string){
    return this.badgeService.findOne(id)
  }

  // @Get('blob')
  // async loadImage() {
  //   const resp = await this.httpService.axiosRef.get(
  //     `https://res.cloudinary.com/dreyhlhxu/image/upload/v1711221566/hfpltnjbuxc18zawhet3.png`,
  //     {responseType: 'blob'}
  //     )
  //   console.log(resp.data);
  // }

  /* Our Problem */
  // 1. user can call anytime if they know how to parse body

  /*  Must think */
  // 1. how to keep templateCode and any data when mintBadge

  

}
