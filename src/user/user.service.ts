import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { MongoRepository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dtos/create-user.dto';
import { KeyStore } from 'web3';
import { ObjectId } from 'mongodb';

@Injectable()
export class UserService {

  constructor(@InjectRepository(User) private userRepo: MongoRepository<User>) {}
  
  create(userDto: CreateUserDto, keyStoreJsonV3: KeyStore) {
    const user: User = this.userRepo.create({...userDto, keyStoreJsonV3});
    return this.userRepo.save(user);
  }

  async findOne(id: string): Promise<User> {

    if(!id) {
      return null;
    }

    try {
      const user: User = await this.userRepo.findOneBy( { _id: new ObjectId(id) });
      return user;
    } catch (error) {
      throw new BadRequestException('userId is not found');      
    }

  }

  async findAllUser(){
    const user = await this.userRepo.find({});
    return user;
  } 

  async find(email: string) {
    const user = await this.userRepo.find({ where: { email }});
    return user;
  }

  async findByTelNo(telNo: string) {
    const user = await this.userRepo.find({ where: { telNo } });
    
    return user;
  }

  async update(id: string, attrs: Partial<User>) {
    // 1. find that by id
    const user = await this.findOne(id); 

    if(!user) {
      throw new NotFoundException('user not found!');
    }

    // 2. update data
    Object.assign(user, attrs);

    // 3. save it back to database
    return this.userRepo.save(user);
  }

  async remove (id: string) {
    const user = await this.findOne(id);

    if(!user) {
      throw new NotFoundException('user not found!');
    }

    // remove work with instance not plain object
    return this.userRepo.remove(user);
  }

}
