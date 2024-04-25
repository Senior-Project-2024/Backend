import { BadRequestException, Body, Controller, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { OrganizeGuard } from 'src/guards/organize.guard';
import { ThirdPartyGuard } from 'src/guards/third-party.guard';
import { CurrentUser } from 'src/user/decorators/current-user.decorator';
import { UserRole } from 'src/user/user.constant';
import { User } from 'src/user/user.entity';
import { BadgesService } from './badges.service';
import { CreateBadgeTemplateDto } from './dtos/create-badge-template.dto';

@Controller('badges')
export class BadgesController {

  constructor(
    private badgeService: BadgesService,
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

  @Delete('/:id')
  async deleteBadge(@Param('id') id: string){
    return this.badgeService.remove(id)
  }

  @Get('/:id')
  async getBadgeById(@Param('id') id: string){
    return this.badgeService.findOne(id)
  }
  

}
