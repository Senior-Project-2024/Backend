import { Get, Patch, Post, Controller, Body, Param, Query, Delete, Session, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserResponseDto } from './dtos/user-resp.dto';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Serialize } from '../interceptor/serializer.interceptor';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthGuard } from 'src/guards/auth.guard';

@Controller('auth')
@Serialize(UserResponseDto)
// @UseGuards(AuthGuard)
export class UserController {

  constructor(
    private userService: UserService,
    private authService: AuthService,
    ) {}

  @Post('/signup')
  async createUser(@Body() body: CreateUserDto, @Session() session: any): Promise<User> {
    const user = await this.authService.signUp(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/signin')
  async signIn(@Body() body: CreateUserDto, @Session() session: any): Promise<User> {
    const user = await this.authService.signIn(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Get('/whoAmI')
  getCurrentUser(@CurrentUser() user: User) {
    return user;
  }

  @Post('/signout') 
  signOut(@Session() session: any) {
    session.userId = null;
  }

  @Get('/:id')
  findUser(@Param('id') id: string) { // param is only string, we should parseInt before send to service
    return this.userService.findOne(parseInt(id));
  }

  @Get('')
  findAllUsers(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.userService.remove(parseInt(id));
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(parseInt(id), body);
  }  
}
