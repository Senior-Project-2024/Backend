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
    const user: User = this.userRepo.create({...userDto, isConfirm : false, hashCode : "", keyStoreJsonV3});
    return this.userRepo.save(user);
  }

  async findOne(id: string): Promise<User> {

    if(!id || id.length === 0) {
      return null;
    }

    const user: User | null = await this.userRepo.findOneBy( { _id: new ObjectId(id) });
    
    return user;
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

  async findByLandlineNumber(landlineNumber : string) {
    return await this.userRepo.find({where : {landlineNumber}})
  }

  async update(id: string, attrs: Partial<User>) {
    // 1. find that by id
    const user = await this.findOne(id); 

    if(!user) {
      throw new NotFoundException('user not found!');
    }

    console.log(attrs.password)

    // 2. update data
    Object.assign(user, attrs);

    // 3. save it back to database
    return this.userRepo.save(user);
  }

  async findByEmailAndUpdateHashCode(email : string, hashCode : string){
    const [user] = await this.find(email); 
    
    if(!user){
      throw new NotFoundException('user not found!');
    }

    // update hashCode
    await this.userRepo.findOneAndUpdate({email} , {$set:{hashCode}});

    return user;
  }

  async findByHashCode(hashCode : string){

    const [user] = await this.userRepo.find({where : {hashCode}})
    
    if(!user){
      // throw new NotFoundException('hashCode not found!');
    }

    return user;
  }

  async findByPublicKey(publickey: string) {
    return this.userRepo.find({ where: { 'keyStoreJsonV3.address': publickey.toLowerCase()  }});
  }
   
  async findHashCodeAndUpdateIsConfirm(hashCode : string){

    const user = await this.userRepo.find({where : {hashCode}})
    
    if(user.length === 0){
      return "hashCode not found";
      // throw new NotFoundException('user not found!');
    }

    // update isConfirm
    const updated = await this.userRepo.findOneAndUpdate({hashCode} , {$set:{ isConfirm : true}});

    return updated;
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
