import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';


@Injectable()
export class UserService {

  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}
  
  create(email: string, password: string) {
    const user = this.userRepo.create({ email, password });
    
    return this.userRepo.save(user);
  }

  async findOne(id: number) {

    if(!id) {
      return null;
    }

    const user = await this.userRepo.findOneBy({ id });

    if(!user) {
      throw new NotFoundException('user not found!');
    }
    
    return user;
  }

  async find(email: string) {
    const user = await this.userRepo.find({ where: { email }});
  
    if(!user){
      throw new NotFoundException('user not found!');
    } 

    return user;
  }

  async update(id: number, attrs: Partial<User>) {
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

  async remove (id: number) {
    const user = await this.findOne(id);

    if(!user) {
      throw new NotFoundException('user not found!');
    }

    // remove work with instance not plain object
    return this.userRepo.remove(user);
  }

}
