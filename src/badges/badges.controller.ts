import { BadRequestException, Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBadRequestResponse, ApiExcludeEndpoint, ApiHeader, ApiHeaders, ApiNotFoundResponse, ApiOkResponse, ApiQuery, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
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
  @ApiSecurity('api-token')
  @ApiOkResponse({ description: 'Successful mint badge to user!.'})
  @ApiNotFoundResponse({ description: 'Not Found Image Blob of Badge Image.'})
  @ApiBadRequestResponse({ description: 'Can not upload metadata of nft or error from smart contract'})
  @ApiQuery({ name: 'publickey', type: 'string', description: 'Wallet address of user from GET auth/thirdParty'})
  @ApiQuery({ name: 'templateCode', type: 'string', description: 'Badge template code that you want to mint to user'})
  @ApiQuery({ name: 'evidenceURL', type: 'string', description: `Evidence of students' studies within the course`})
  @ApiTags('ThirdParty')
  mintBadge(
    @Query('publickey') publicKey: string, 
    @Query('templateCode') templateCode: string,
    @Query('evidenceURL') evidenceURL: string,
  ) {
    return this.badgeService.mintBadge(publicKey, templateCode, evidenceURL);
  }
  
  @Get('getAllBadgeUser')
  @ApiExcludeEndpoint()
  thirdPartyGetBadge(
    @Query('publickey') publickKey : string
  ){
    return this.badgeService.getAllBadgeUser(publickKey);
  }

  @Get('getSpecificBadgeUser')
  @ApiExcludeEndpoint()
  getSpecificBadgeUser(
    @Query('id') id : string
  ){
    return this.badgeService.getSpecificBadgeUser(id);
  }

  @Post('')
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
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
  @ApiExcludeEndpoint()
  async getAllBadges(){
    return this.badgeService.findAll();
  }

  @Get('/organize/:id')
  @ApiExcludeEndpoint()
  async getBadgeByOrgnizeId(@Param('id') id: string){
    return this.badgeService.findByUserId(id)
  }

  @Delete('/:id')
  @ApiExcludeEndpoint()
  async deleteBadge(@Param('id') id: string){
    return this.badgeService.deleteBadge(id)
  }

  @Get('/:id')
  @ApiExcludeEndpoint()
  async getBadgeById(@Param('id') id: string){
    return this.badgeService.findOne(id)
  }

}
