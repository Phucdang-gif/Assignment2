import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { order_status } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let mockPrisma: any;
  let mockUsersService: any;

  beforeEach(async () => {
    mockPrisma = {
      order: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      $queryRaw: jest.fn(),
    };

    mockUsersService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findBaristaQueue (Quyền xem đơn trong Barista Dashboard)', () => {
    it('Khách hàng (customer) chỉ xem được danh sách đơn hàng của chính mình', async () => {
      const customerId = 10;
      mockUsersService.findOne.mockResolvedValue({
        id: customerId,
        email: 'customer@brewlite.com',
        role: 'customer',
      });
      mockPrisma.order.findMany.mockResolvedValue([
        { id: BigInt(1), userId: BigInt(customerId), status: order_status.PAID },
      ]);

      await service.findBaristaQueue(customerId);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(customerId);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: BigInt(customerId),
          }),
        }),
      );
    });

    it('Barista có thể xem toàn bộ đơn hàng trong hàng đợi (không bị giới hạn bởi userId)', async () => {
      const baristaId = 2;
      mockUsersService.findOne.mockResolvedValue({
        id: baristaId,
        email: 'barista@brewlite.com',
        role: 'barista',
      });
      mockPrisma.order.findMany.mockResolvedValue([
        { id: BigInt(1), userId: BigInt(10), status: order_status.PAID },
        { id: BigInt(2), userId: BigInt(20), status: order_status.PREPARING },
      ]);

      await service.findBaristaQueue(baristaId);

      expect(mockUsersService.findOne).toHaveBeenCalledWith(baristaId);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.not.objectContaining({
            userId: expect.anything(),
          }),
        }),
      );
    });
  });

  describe('baristaUpdateStatus (Quyền chỉnh sửa trạng thái đơn hàng)', () => {
    it('Khách hàng không có quyền chỉnh sửa trạng thái đơn hàng -> ném ForbiddenException', async () => {
      const customerId = 10;
      mockUsersService.findOne.mockResolvedValue({
        id: customerId,
        email: 'customer@brewlite.com',
        role: 'customer',
      });

      await expect(
        service.baristaUpdateStatus(1, order_status.PREPARING, customerId),
      ).rejects.toThrow(ForbiddenException);

      expect(mockPrisma.order.update).not.toHaveBeenCalled();
    });

    it('Barista có quyền cập nhật trạng thái đơn hàng -> cập nhật thành công', async () => {
      const baristaId = 2;
      mockUsersService.findOne.mockResolvedValue({
        id: baristaId,
        email: 'barista@brewlite.com',
        role: 'barista',
      });

      mockPrisma.order.findUnique.mockResolvedValue({
        id: BigInt(1),
        status: order_status.PAID,
        OrderItem: [],
        Payment: [],
      });

      mockPrisma.order.update.mockResolvedValue({
        id: BigInt(1),
        status: order_status.PREPARING,
      });

      const updated = await service.baristaUpdateStatus(
        1,
        order_status.PREPARING,
        baristaId,
      );

      expect(updated.status).toBe(order_status.PREPARING);
      expect(mockPrisma.order.update).toHaveBeenCalled();
    });
  });

  describe('findOne (Quyền xem chi tiết đơn hàng / Lịch sử đơn)', () => {
    it('Khách hàng xem đơn hàng của chính mình -> thành công', async () => {
      const customerId = 10;
      const orderId = 101;

      mockPrisma.order.findUnique.mockResolvedValue({
        id: BigInt(orderId),
        userId: BigInt(customerId),
        status: order_status.PAID,
        OrderItem: [],
        Payment: [],
      });

      const order = await service.findOne(orderId, customerId);

      expect(order).toBeDefined();
      expect(Number(order.userId)).toBe(customerId);
    });

    it('Khách hàng xem đơn hàng của người khác -> ném ForbiddenException', async () => {
      const currentCustomerId = 10;
      const otherCustomerId = 99;
      const orderId = 102;

      mockPrisma.order.findUnique.mockResolvedValue({
        id: BigInt(orderId),
        userId: BigInt(otherCustomerId),
        status: order_status.PAID,
        OrderItem: [],
        Payment: [],
      });

      mockUsersService.findOne.mockResolvedValue({
        id: currentCustomerId,
        email: 'customer@brewlite.com',
        role: 'customer',
      });

      await expect(
        service.findOne(orderId, currentCustomerId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('Barista có thể xem chi tiết đơn hàng của bất kỳ khách hàng nào để xử lý pha chế', async () => {
      const baristaId = 2;
      const customerId = 99;
      const orderId = 103;

      mockPrisma.order.findUnique.mockResolvedValue({
        id: BigInt(orderId),
        userId: BigInt(customerId),
        status: order_status.PREPARING,
        OrderItem: [],
        Payment: [],
      });

      mockUsersService.findOne.mockResolvedValue({
        id: baristaId,
        email: 'barista@brewlite.com',
        role: 'barista',
      });

      const order = await service.findOne(orderId, baristaId);

      expect(order).toBeDefined();
      expect(Number(order.id)).toBe(orderId);
    });
  });

  describe('getOrderStatuses', () => {
    it('lấy danh sách các trạng thái đơn hàng từ database enum', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([
        {
          enum_range: [
            'PENDING',
            'PAID',
            'PREPARING',
            'READY',
            'COMPLETED',
            'PAYMENT_FAILED',
            'CANCELLED',
          ],
        },
      ]);

      const statuses = await service.getOrderStatuses();
      expect(statuses).toEqual([
        'PENDING',
        'PAID',
        'PREPARING',
        'READY',
        'COMPLETED',
        'PAYMENT_FAILED',
        'CANCELLED',
      ]);
    });
  });
});
