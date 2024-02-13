import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { NotFoundException } from '@nestjs/common';
describe('UsersController', () => {
  let controller: UsersController;

  let fakeUsersService: Partial<UsersService>;
  let fakeAuthService: Partial<AuthService>;

  beforeEach(async () => {
    fakeUsersService = {
      findOne: (id: number) => {
        return Promise.resolve({
          id,
          email: 'foo@gmail.com',
          password: '123456',
        } as User);
      },
      find: (email: string) => {
        return Promise.resolve([{ id: 1, email, password: '123456' } as User]);
      },
      // remove: (id: number) => {
      //   return Promise.resolve({
      //     id,
      //     email: 'foo@gmail.com',
      //     password: '123456',
      //   } as User);
      // },
      // update: (id: number, attrs) => {
      //   return Promise.resolve({
      //     id,
      //     email: 'foo@gmail.com',
      //     password: '123456',
      //     ...attrs,
      //   } as User);
      // },
    };

    fakeAuthService = {
      // signup: () => {},
      signin: (email: string, password: string) => {
        return Promise.resolve({ id: 1, email, password } as User);
      },
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

  it('findAllUsers return a list of users with the given email', async () => {
    const users = await controller.findAllUsers('foo@gmail.com');

    expect(users.length).toEqual(1);
    expect(users[0].email).toEqual('foo@gmail.com');
  });

  it('findUser return a user with the given id', async () => {
    const user = await controller.findUser('1');

    expect(user).toBeDefined();
  });

  it('findUser throw an error if the given not found', async () => {
    fakeUsersService.findOne = () => null;

    await expect(controller.findUser('1')).rejects.toThrow(NotFoundException);
  });

  it('signin updates session object and return user', async () => {
    const session = { userId: -1 };
    const user = await controller.signIn(
      {
        email: 'foo@gmail.com',
        password: '123456',
      },
      session,
    );

    expect(user.id).toEqual(1);
    expect(session.userId).toEqual(1);
  });
});
