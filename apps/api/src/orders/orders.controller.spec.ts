import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard, ROLES_KEY } from '../auth/roles.guard';
import { Reflector } from '@nestjs/core';

describe('OrdersController (Security & Guards)', () => {
  let controller: OrdersController;
  const reflector = new Reflector();

  const mockUsersService = {
    findOne: jest.fn(),
  };

  const mockOrdersService = {
    create: jest.fn(),
    findAllByUser: jest.fn(),
    findBaristaQueue: jest.fn(),
    baristaUpdateStatus: jest.fn(),
    cancelOrder: jest.fn(),
    retryPayment: jest.fn(),
    getOrderStatuses: jest.fn(),
    validateVoucher: jest.fn(),
    findOneForUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
  });

  it('phải được định nghĩa', () => {
    expect(controller).toBeDefined();
  });

  it('các route cập nhật trạng thái của barista phải yêu cầu JwtAuthGuard và RolesGuard với role barista', () => {
    const baristaRoutes = [
      controller.updateOrderStatus,
      controller.prepareOrder,
      controller.readyOrder,
      controller.completeOrder,
    ];

    for (const route of baristaRoutes) {
      const guards = Reflect.getMetadata('__guards__', route);
      expect(guards).toBeDefined();
      expect(guards).toEqual(expect.arrayContaining([JwtAuthGuard, RolesGuard]));

      const roles = reflector.get<string[]>(ROLES_KEY, route);
      expect(roles).toBeDefined();
      expect(roles).toEqual(expect.arrayContaining(['barista']));
    }
  });

  it('các route người dùng bình thường phải có JwtAuthGuard bảo vệ', () => {
    const customerRoutes = [
      controller.create,
      controller.findAll,
      controller.findMyOrders,
      controller.getBaristaQueue,
      controller.cancelOrder,
      controller.retryPayment,
      controller.findOne,
    ];

    for (const route of customerRoutes) {
      const guards = Reflect.getMetadata('__guards__', route);
      expect(guards).toBeDefined();
      expect(guards).toEqual(expect.arrayContaining([JwtAuthGuard]));
    }
  });

  it('route getOrderStatuses và validateVoucher là public', () => {
    const statusesGuards = Reflect.getMetadata('__guards__', controller.getOrderStatuses);
    expect(statusesGuards).toBeUndefined();

    const voucherGuards = Reflect.getMetadata('__guards__', controller.validateVoucher);
    expect(voucherGuards).toBeUndefined();
  });
});
