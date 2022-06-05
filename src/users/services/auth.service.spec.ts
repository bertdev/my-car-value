import { BadRequestException } from '@nestjs/common';
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

  it('throw an error if user signs up with email that is in use', async () => {
    fakeUsersService.find = (email: string) =>
      Promise.resolve([{ id: 1, email, password: 'test' }]);
    await expect(service.signup('test@test.com', 'test')).rejects.toThrow(
      BadRequestException,
    );
  });
});
