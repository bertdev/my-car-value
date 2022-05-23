import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  create(email: string, password: string): Promise<User> {
    const user = this.usersRepository.create({ email, password });

    return this.usersRepository.save(user);
  }

  findOne(id: number): Promise<User> {
    return this.usersRepository.findOne(id);
  }

  find(email: string): Promise<User[]> {
    return this.usersRepository.find({ email });
  }

  async update(id: number, attributes: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found!');
    }
    Object.assign(user, attributes);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new Error('User not found!');
    }
    return this.usersRepository.remove(user);
  }
}
