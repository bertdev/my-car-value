import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from '../user.entity';
import { AuthService, UsersService } from './index';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) =>
        Promise.resolve(users.filter((i) => i.email === email)),
      create: (email: string, password: string) => {
        const user = { id: Math.floor(Math.random() * 9999), email, password };
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of AuthService', async () => {
    expect(service).toBeInstanceOf(AuthService);
  });

  it('can create a new user with a salted and hashed password', async () => {
    const credentials = {
      email: 'test@test.com',
      password: 'test1234',
    };
    const user = await service.signup(credentials.email, credentials.password);
    const [salt, hash] = user.password.split('.');

    expect(user.email).toEqual(credentials.email);
    expect(user.password).not.toEqual(credentials.password);
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('test@test.com', 'test');
    await expect(service.signup('test@test.com', 'test')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with an unused email', async () => {
    await expect(service.signin('test@test.com', 'test')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if a invalid password is provided', async () => {
    await service.signup('test@test.com', 'test');
    await expect(
      service.signin('test@test.com', 'test1234'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns a user if password and email provided are correct', async () => {
    await service.signup('test@test.com', 'test');
    const user = await service.signin('test@test.com', 'test');
    expect(user).toBeDefined();
  });
});
