import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

describe('UsersController (Security & Guards)', () => {
  let controller: UsersController;
  const reflector = new Reflector();

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('phải được định nghĩa', () => {
    expect(controller).toBeDefined();
  });

  it('phải được bảo vệ toàn bộ controller bởi JwtAuthGuard và RolesGuard', () => {
    const guards = Reflect.getMetadata('__guards__', UsersController);
    expect(guards).toBeDefined();
    expect(guards).toEqual(
      expect.arrayContaining([JwtAuthGuard, RolesGuard]),
    );
  });

  it('phải yêu cầu vai trò barista hoặc admin cho UsersController', () => {
    const roles = reflector.get<string[]>(ROLES_KEY, UsersController);
    expect(roles).toBeDefined();
    expect(roles).toEqual(expect.arrayContaining(['barista']));
  });

  it('findAll gọi usersService.findAll', async () => {
    mockUsersService.findAll.mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });
    const result = await controller.findAll({ page: 1, limit: 10 });
    expect(mockUsersService.findAll).toHaveBeenCalledWith({ page: 1, limit: 10 });
    expect(result).toEqual({ items: [], total: 0, page: 1, limit: 10 });
  });

  it('findOne gọi usersService.findOne', async () => {
    mockUsersService.findOne.mockResolvedValue({ id: 1, email: 'test@brewlite.com' });
    const result = await controller.findOne(1);
    expect(mockUsersService.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual({ id: 1, email: 'test@brewlite.com' });
  });
});
