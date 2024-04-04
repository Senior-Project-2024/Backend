import { Get, Patch, Post, Controller, Body, Param, Query, Delete, Session, UseGuards, NotFoundException, BadRequestException, Request, Redirect, Headers, Res, HttpStatus } from '@nestjs/common';
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

@Controller('auth')
// @UseGuards(AuthGuard)
export class UserController {

  constructor(
    private userService: UserService,
    private authService: AuthService,
    ) {}

  @Post('/headers')
  async testHeaders(@Headers() headers: any) {
    console.log(headers);
  }

  @Post('/thirdParty')
  async thirdPartyAuthentication(@Headers() headers: any) {
    console.log(headers);
  }

  @Get('thirdParty')
  async thirdPartyAuthenticationForm(@CurrentUser() user: User, @Res() res: Response) {
    
    if(!user) {
      return res.status(HttpStatus.FORBIDDEN).send(this.authService.loginForm());
    }

  }


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
    return user;
  }

  @Get('/whoAmI')
  getCurrentUser(@CurrentUser() user: User, @CurrentUser(UserRole.organization,) organize: User) {
    return { user, organize };
  }

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

  @Post('/apiToken')
  getApiToken(@CurrentUser(UserRole.organization) organize: User)  {

    if(!organize) {
      throw new NotFoundException('You are not Logged in.');
    }

    return this.authService.generateTokenApi(organize.id.toString()); // just save it to database 
  }
  
  @Get('/all')
  findAlltable(){
    return this.userService.findAllUser();
  }
  
  @Get('/confirmEmail')
  @Redirect()
  confirmEmail(@Query() query : {hashCode : string}, @Session() session : IAppSession){
    return this.authService.confirmEmail(query.hashCode, session.timeStamp);
  }

  @Get('/:id')
  async findUser(@Param('id') id: string) { // param is only string, we should parseInt before send to servicethis.userService.findOne(id)
    return this.userService.findOne(id);
  }
  
  @Get('')
  findAllUsers(@Query('email') email: string) { // not check 
    return this.userService.find(email);
  }


  @Delete('/:id')
  removeUser(@Param('id') id: string) { // not check
    return this.userService.remove(id);
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) { // not check
    return this.userService.update(id, body);
  }

  @Post('/sendEmail')
  async sendEmail(@Body() body : SendEmailDto, @Session() session : IAppSession ){
    const timeStamp = await this.authService.sendEmail(body.email);
    session.timeStamp = timeStamp;
  }
  
  
}
