import { Test } from '@nestjs/testing';

import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import exp from 'constants';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUserService: Partial<UsersService>;
  beforeEach(async () => {
    const users: User[] = [];
    // Create a fake copy of UserService
    fakeUserService = {
      find: (email) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;
        const index = users.push(user);

        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUserService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('create new user with salted and hashed password', async () => {
    const user = await service.signup('foo@gmail.com', '123456');
    expect(user.password).not.toEqual('123456');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    await service.signup('foo@gmail.com', '123456');
    await expect(service.signup('foo@gmail.com', '123456')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('throws if signin is called with unused email', async () => {
    await expect(service.signin('foo@gmail.com', '123456')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws if an invalid password is provided', async () => {
    await service.signup('foo@gmail.com', '123456');

    await expect(service.signin('foo@gmail.com', '12345')).rejects.toThrow(
      BadRequestException,
    );
  });

  it('returns a user if correct password is provided ', async () => {
    await service.signup('foo@gmail.com', '123456');

    const user = await service.signin('foo@gmail.com', '123456');

    expect(user).toBeDefined();
  });
});
