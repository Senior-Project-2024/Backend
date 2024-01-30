import { Get, Patch, Post, Controller, Body, Param, Query, Delete, Session, UseGuards, NotFoundException, BadRequestException } from '@nestjs/common';
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

@Controller('auth')
// @UseGuards(AuthGuard)
export class UserController {

  constructor(
    private userService: UserService,
    private authService: AuthService,
    ) {}

  @Post('/signup')
  @Serialize(UserResponseDto)
  async createUser(@Body() body: CreateUserDto, @Session() session: IAppSession): Promise<User> {
    const user = await this.authService.signUp(body);
    // session.userId = user.id;
    return user;
  }

  @Post('/signin')
  @Serialize(UserSignInRespDto)
  async signIn(@Body() body: UserSignInReqDto, @Session() session: IAppSession): Promise<UserSignInRespDto> {
    const user = await this.authService.signIn(body.email, body.password);
    session.userId = user.id;
    session.userWalletPrivateKey = user.ethWallet.privateKey;
    return user;
  }

  @Get('/whoAmI')
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Post('/signout') 
  signOut(@Session() session: IAppSession) {
    session.userId = null;
    session.userWalletPrivateKey = null;
  }

  @Post('/apiToken')
  getApiToken(@CurrentUser() user: User)  {

    if(!user) {
      throw new NotFoundException('You are not Logged in.');
    }

    if(user.role !== UserRole.organization ) {
      throw new BadRequestException('You are not allowed to generate api token.');
    }

    return this.authService.generateTokenApi(user.id.toString()); // just save it to database 
  }
  
  @Get('/all')
  findAlltable(){
    return this.userService.findAllUser();
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


}
