import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthService, UsersService } from './index';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password }),
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
    fakeUsersService.find = (email: string) =>
      Promise.resolve([{ id: 1, email, password: 'test' }]);
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
    fakeUsersService.find = () =>
      Promise.resolve([{ id: 1, email: 'test@test.com', password: 'test' }]);
    await expect(
      service.signin('test@test.com', 'test1234'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('returns a user if password and email provided are correct', async () => {
    const newUser = await service.signup('test@test.com', 'test');
    fakeUsersService.find = () => Promise.resolve([{ ...newUser }]);
    const user = await service.signin('test@test.com', 'test');
    expect(user).toBeDefined();
  });
});
