import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { AuthService } from './services/auth.service';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) =>
        Promise.resolve({ id, email: 'test@test.com', password: 'test' }),
      find: (email: string) =>
        Promise.resolve([{ id: 1, email, password: 'test' }]),
      remove: (id: number) =>
        Promise.resolve({ id, email: 'test@test.com', password: 'test' }),
      // update: () => {},
    };
    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
        {
          provide: AuthService,
          useValue: fakeAuthService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('findAllUsers returns an array of users with the given email', async () => {
    const users = await controller.findAllUsers('test@test.com');
    expect(users).toBeInstanceOf(Array);
    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('test@test.com');
  });

  it('findUser returns an user with the given email', async () => {
    const user = await controller.findUser('1');
    expect(user.id).toBeDefined();
  });

  it('findUser returns an error if one user was not found with the id provided', async () => {
    fakeUsersService.findOne = () => null;
    await expect(controller.findUser('1')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('signin update session object and returns a user', async () => {
    const session = { userId: null };
    const user = await controller.signin(
      { email: 'test@test.com', password: 'test' },
      session,
    );
    expect(user).toBeDefined();
    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(user.id);
  });
});
