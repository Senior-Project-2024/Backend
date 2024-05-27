import { ConfigService } from '@nestjs/config';
import { KeyStore } from 'web3';
import { Get, Patch, Post, Controller, Body, Param, Query, Delete, Session, UseGuards, NotFoundException, BadRequestException, Request, Redirect, Headers, Res, HttpStatus, ForbiddenException, Render } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-resp.dto';
import { UserSignInRespDto } from './dtos/user-sign-in-resp.dto';
import { UserSignInReqDto } from './dtos/user-sign-in-req.dto';
import { IAppSession } from '../utils/interfaces/app-session.interface';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Serialize } from '../interceptor/serializer.interceptor';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { ThirdPartyGuard } from 'src/guards/third-party.guard';
import { ObjectId } from 'mongodb';
import { UserRole } from './user.constant';
import { SendEmailDto } from './dtos/send-email.dto';
import { ConfirmEmailDto } from './dtos/confirm-email.dto';
import { UserSignOutReqDto } from './dtos/user-sign-out.dto';
import { Response } from 'express'
import { UserSessionDto } from './dtos/user-session.dto';
import { BlockChainService } from 'src/blockchian.service';
import { ApiExcludeEndpoint, ApiMovedPermanentlyResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';

@Controller('auth')
// @UseGuards(AuthGuard)
export class UserController {

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private blockchainService: BlockChainService,
    private configService: ConfigService
    ) {}

  @Post('/headers')
  @ApiExcludeEndpoint()
  async testHeaders(@Headers() headers: any) {
    console.log(headers);
  }

  @Post('thirdParty')
  @ApiExcludeEndpoint()
  async thirdPartyAuthentication(
    @Body() body: UserSignInReqDto,
    @Res() res: Response,
    @Session() session: IAppSession,
    @Query('redirectURL') redirectURL: string) {

    const user = await this.authService.signIn(body.email, body.password);

    if(user.role === UserRole.user) {
      session.userId = user.id;
      session.userWalletPrivateKey = user.ethWallet.privateKey;
      const redirectURL_with_params = redirectURL + "?userId=" + user.id + "&publickey=" + user.ethWallet.address;
      return res.json({ statusCode: 201, message: 'login success', redirectURL : redirectURL_with_params  });
    }

    throw new ForbiddenException('user not login!.');
  }

  @Get('thirdParty')
  @ApiTags('ThirdParty')
  @ApiOkResponse({ description: 'Successful get signIn form for user'})
  @ApiNotFoundResponse({ description: 'Not found server try again!.'})
  @ApiMovedPermanentlyResponse({ description: 'User credential exist!.'})
  async thirdPartyAuthenticationForm(
    @CurrentUser() user: User, 
    @Res() res: Response, 
    @Query('redirectURL') redirectURL: string) {

    const apiHost = this.configService.get<string>('HOST');

    if(apiHost.length === 0) {
      throw new NotFoundException('Server not found !');
    }

    if(user && user.role === UserRole.user) {
      const redirectURL_with_params = redirectURL + "?userId=" + user.id + "&publickey=" + user.keyStoreJsonV3.address;
      res.redirect(redirectURL_with_params);
    } else {
      return res.status(200).render(
        'signInForm',
        { redirectURL, apiHost },
      );
    }
    
  }

  @ApiExcludeEndpoint()
  @Post('/signup')
  @Serialize(UserResponseDto)
  async createUser(@Body() body: CreateUserDto, @Session() session: IAppSession): Promise<User> {

    if(body.role === UserRole.user) {
      body.organizeName = '';
      body.landlineNumber = '';
    }

    if(body.role === UserRole.organization) {
      body.telNo = '';
    }

    const user = await this.authService.signUp(body);
    // session.userId = user.id;
    return user;
  }

  @ApiExcludeEndpoint()
  @Post('/signin')
  @Serialize(UserSignInRespDto)
  async signIn(@Body() body: UserSignInReqDto, @Session() session: IAppSession): Promise<UserSignInRespDto> {
    const user = await this.authService.signIn(body.email, body.password);
    
    if(user.role === UserRole.user) {
      session.userId = user.id;
      session.userWalletPrivateKey = user.ethWallet.privateKey;
    }

    if(user.role === UserRole.organization) {
      session.organizeId = user.id;
    } 

    console.log(session);
    return user;
  }

  @ApiExcludeEndpoint()
  @Get('/whoAmI')
  @Serialize(UserSessionDto)
  getCurrentUser(@CurrentUser() user: User, @CurrentUser(UserRole.organization,) organize: User) {
    console.log(user);
    console.log(organize);
    return { user, organize };
  }

  @ApiExcludeEndpoint()
  @Post('/signout') 
  signOut(@Body() body: UserSignOutReqDto, @Session() session: IAppSession) {

    if(body.role === UserRole.user) {
      session.userId = null;
      session.userWalletPrivateKey = null;  
    } 

    if(body.role === UserRole.organization) {
      session.organizeId = null;  
    }
    
  }

  @ApiExcludeEndpoint()
  @Post('/apiToken')
  getApiToken(@CurrentUser(UserRole.organization) organize: User)  {

    if(!organize) {
      throw new NotFoundException('You are not Logged in.');
    }

    return this.authService.generateTokenApi(organize.id.toString()); // just save it to database 
  }
  
  @ApiExcludeEndpoint()
  @Get('/all')
  findAlltable(){
    return this.userService.findAllUser();
  }
  
  @ApiExcludeEndpoint()
  @Get('/confirmEmail')
  @Redirect()
  confirmEmail(@Query() query : {hashCode : string}, @Session() session : IAppSession){
    return this.authService.confirmEmail(query.hashCode, session.timeStamp);
  }

  @ApiExcludeEndpoint()
  @Get('/:id')
  async findUser(@Param('id') id: string) { // param is only string, we should parseInt before send to servicethis.userService.findOne(id)
    return this.userService.findOne(id);
  }
  
  @ApiExcludeEndpoint()
  @Get('')
  findAllUsers(@Query('email') email: string) { // not check 
    return this.userService.find(email); 
  }

  @ApiExcludeEndpoint()
  @Delete('/:id')
  removeUser(@Param('id') id: string) { // not check
    return this.userService.remove(id);
  }

  @ApiExcludeEndpoint()
  @Patch('/:id')
  async updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) { // not check

    // if user want to change password
    if(body.password && body.newPassword) { 
      //1. check old password from request match password in db ?
      const user = await this.userService.findOne(id);
      
      if(!user) {
        throw new NotFoundException('user not found!');
      }
      
      await this.authService.checkPasswordMatch(body.password, user.password);

      //2. create hash of a new password
      const newHashPassword: string = await this.authService.hashPassword(body.newPassword);

      //3. change password encrypted wallet
      const keyStoreJsonV3: KeyStore = await this.blockchainService.changePasswordEncryptedWallet(
        body.password,
        body.newPassword,
        user.keyStoreJsonV3
      );

      //4. update value in body for update
      body.password = newHashPassword;
      body.keyStoreJsonV3 = keyStoreJsonV3;
    }

    return this.userService.update(id, body);
  }

  @ApiExcludeEndpoint()
  @Post('/sendEmail')
  async sendEmail(@Body() body : SendEmailDto, @Session() session : IAppSession ){
    const timeStamp = await this.authService.sendEmail(body.email);
    session.timeStamp = timeStamp;
  }
  
  
}
