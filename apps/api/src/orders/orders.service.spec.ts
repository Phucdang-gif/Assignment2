import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
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
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn(),
        findFirst: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
      },
      product: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
      },
      ingredient: {
        update: jest.fn(),
      },
      productRecipeItem: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      topping: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      $queryRaw: jest.fn(),
      $transaction: jest.fn(async (cb) => {
        if (typeof cb === 'function') {
          return cb(mockPrisma);
        }
        return cb;
      }),
    };

    mockUsersService = {
      findOne: jest.fn().mockResolvedValue({ id: 1, email: 'test@brewlite.com', loyaltyPoints: 0 }),
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

  describe('create (API tạo đơn hàng & Optimistic Lock - FR-05)', () => {
    it('đặt hàng khi còn đủ tồn kho: trừ tồn kho và tăng version thành công trong transaction', async () => {
      const product = {
        id: BigInt(1),
        name: 'Cà phê sữa',
        price: 35000,
        stock: 10,
        version: 0,
        status: 'active',
      };

      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.product.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.order.create.mockResolvedValue({ id: BigInt(201), total: 70000 });

      const result = await service.create(
        {
          items: [{ productId: 1, size: 'M', qty: 2, price: 35000 }],
        },
        1,
      );

      expect(result.orderId).toBeDefined();
      expect(mockPrisma.product.updateMany).toHaveBeenCalledWith({
        where: {
          id: product.id,
          version: product.version,
          stock: { gte: 2 },
        },
        data: {
          stock: { decrement: 2 },
          version: { increment: 1 },
        },
      });
      expect(mockPrisma.order.create).toHaveBeenCalled();
    });

    it('từ chối đặt hàng khi số lượng yêu cầu vượt quá tồn kho (BadRequestException)', async () => {
      const product = {
        id: BigInt(1),
        name: 'Cà phê sữa',
        price: 35000,
        stock: 1,
        version: 0,
        status: 'active',
      };

      mockPrisma.product.findUnique.mockResolvedValue(product);

      await expect(
        service.create(
          {
            items: [{ productId: 1, size: 'M', qty: 2, price: 35000 }],
          },
          1,
        ),
      ).rejects.toThrow(BadRequestException);
    });

    it('mô phỏng race condition: Optimistic Lock phát hiện version mismatch và ném ConflictException khi hết retry', async () => {
      const product = {
        id: BigInt(1),
        name: 'Cà phê sữa',
        price: 35000,
        stock: 10,
        version: 0,
        status: 'active',
      };

      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.product.updateMany.mockResolvedValue({ count: 0 }); // version mismatch!

      await expect(
        service.create(
          {
            items: [{ productId: 1, size: 'M', qty: 1, price: 35000 }],
          },
          2,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('tự động giảm đúng 10% cho khách hàng hạng Vàng (loyaltyPoints >= 50)', async () => {
      mockUsersService.findOne.mockResolvedValue({ id: 1, email: 'gold@brewlite.com', loyaltyPoints: 50 });
      const product = {
        id: BigInt(1),
        name: 'Cà phê sữa',
        price: 45000,
        stock: 10,
        version: 0,
        status: 'active',
      };

      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.product.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.order.create.mockImplementation((args: any) => ({
        id: BigInt(301),
        total: args.data.total,
      }));

      const result = await service.create(
        {
          items: [{ productId: 1, size: 'M', qty: 1, price: 50000 }],
        },
        1,
      );

      expect(result.rawTotal).toBe(50000);
      expect(result.discount).toBe(5000);
      expect(result.total).toBe(45000);
      expect(result.membershipTier).toBe('Vàng');
    });

    it('chống giả mạo giá từ Client: tự tính giá chuẩn từ Database (Product.price + Size + Topping) ngay cả khi Client gửi price = 1', async () => {
      const product = {
        id: BigInt(1),
        name: 'Cà phê sữa',
        price: 30000,
        stock: 10,
        version: 0,
        status: 'active',
      };

      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.product.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.topping.findMany.mockResolvedValue([
        { id: 1, name: 'Trân châu trắng', price: 8000 },
      ]);
      mockPrisma.order.create.mockImplementation((args: any) => ({
        id: BigInt(305),
        total: args.data.total,
      }));

      const result = await service.create(
        {
          items: [
            {
              productId: 1,
              size: 'L', // +10.000đ
              qty: 2,
              price: 1, // Client cố tình sửa giá thành 1đ
              toppings: ['Trân châu trắng'], // +8.000đ
            },
          ],
        },
        1,
      );

      // Giá chuẩn 1 ly = 30.000 (gốc) + 10.000 (Size L) + 8.000 (Topping) = 48.000đ
      // 2 ly = 96.000đ
      expect(result.rawTotal).toBe(96000);
      expect(result.total).toBe(96000);
      expect(mockPrisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            subtotal: 96000,
            total: 96000,
          }),
        }),
      );
    });

    it('kiểm tra tồn kho theo nguyên liệu (ProductRecipeItem & Ingredient): chặn khi không đủ nguyên liệu', async () => {
      const product = {
        id: BigInt(1),
        name: 'Trà đào',
        price: 40000,
        version: 0,
        status: 'active',
      };

      mockPrisma.product.findUnique.mockResolvedValue(product);
      mockPrisma.productRecipeItem.findMany.mockResolvedValue([
        {
          productId: BigInt(1),
          size: 'M',
          ingredientId: 10,
          amount: 50,
          unit: 'ml',
          Ingredient: { id: 10, name: 'Siro đào', stock: 20, unit: 'ml' }, // chỉ còn 20ml, cần 50ml
        },
      ]);

      await expect(
        service.create(
          {
            items: [{ productId: 1, size: 'M', qty: 1, price: 40000 }],
          },
          1,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Order State Machine (assertTransition & updateStatus - FR-07 & FR-08)', () => {
    it('cho phép chuỗi chuyển đổi trạng thái hợp lệ chuẩn: PENDING -> PAID -> PREPARING -> READY -> COMPLETED', () => {
      expect(() =>
        service.assertTransition(order_status.PENDING, order_status.PAID),
      ).not.toThrow();

      expect(() =>
        service.assertTransition(order_status.PAID, order_status.PREPARING),
      ).not.toThrow();

      expect(() =>
        service.assertTransition(order_status.PREPARING, order_status.READY),
      ).not.toThrow();

      expect(() =>
        service.assertTransition(order_status.READY, order_status.COMPLETED),
      ).not.toThrow();
    });

    it('cho phép các nhánh ngoại lệ: thanh toán lỗi và hủy đơn', () => {
      expect(() =>
        service.assertTransition(order_status.PENDING, order_status.PAYMENT_FAILED),
      ).not.toThrow();

      expect(() =>
        service.assertTransition(order_status.PAYMENT_FAILED, order_status.PENDING),
      ).not.toThrow();

      expect(() =>
        service.assertTransition(order_status.PENDING, order_status.CANCELLED),
      ).not.toThrow();

      expect(() =>
        service.assertTransition(order_status.PAYMENT_FAILED, order_status.CANCELLED),
      ).not.toThrow();

      expect(() =>
        service.assertTransition(order_status.PAID, order_status.CANCELLED),
      ).not.toThrow();
    });

    it('CHẶN chuyển đổi sai: PENDING -> COMPLETED (nhảy cóc bước pha chế)', () => {
      expect(() =>
        service.assertTransition(order_status.PENDING, order_status.COMPLETED),
      ).toThrow(BadRequestException);
    });

    it('CHẶN chuyển đổi sai: PENDING -> READY hoặc PAID -> COMPLETED', () => {
      expect(() =>
        service.assertTransition(order_status.PENDING, order_status.READY),
      ).toThrow(BadRequestException);

      expect(() =>
        service.assertTransition(order_status.PAID, order_status.COMPLETED),
      ).toThrow(BadRequestException);
    });

    it('CHẶN chuyển đổi sai từ trạng thái kết thúc: COMPLETED -> PENDING và CANCELLED -> PAID', () => {
      expect(() =>
        service.assertTransition(order_status.COMPLETED, order_status.PENDING),
      ).toThrow(BadRequestException);

      expect(() =>
        service.assertTransition(order_status.CANCELLED, order_status.PAID),
      ).toThrow(BadRequestException);
    });

    it('thực thi chuyển trạng thái tuần tự trên đơn hàng qua updateStatus: PAID -> PREPARING -> READY -> COMPLETED', async () => {
      const orderId = 501;
      let currentStatus: order_status = order_status.PAID;

      mockPrisma.order.findUnique.mockImplementation(async () => ({
        id: BigInt(orderId),
        userId: BigInt(10),
        status: currentStatus,
        OrderItem: [],
        Payment: [],
      }));

      mockPrisma.order.update.mockImplementation(async (args: any) => {
        currentStatus = args.data.status;
        return {
          id: BigInt(orderId),
          userId: BigInt(10),
          status: currentStatus,
          OrderItem: [],
          Payment: [],
        };
      });

      const step1 = await service.updateStatus(orderId, order_status.PREPARING);
      expect(step1.status).toBe(order_status.PREPARING);

      const step2 = await service.updateStatus(orderId, order_status.READY);
      expect(step2.status).toBe(order_status.READY);

      const step3 = await service.updateStatus(orderId, order_status.COMPLETED);
      expect(step3.status).toBe(order_status.COMPLETED);
    });
  });

  describe('findAllByUser & cancelOrder (Lịch sử đơn hàng & Hoàn kho - FR-07 & FR-10)', () => {
    it('lấy danh sách lịch sử đơn hàng lọc đúng theo userId và sắp xếp mới nhất trước', async () => {
      const userId = 15;
      const mockOrders = [
        {
          id: BigInt(2),
          userId: BigInt(userId),
          status: order_status.COMPLETED,
          total: 55000,
          OrderItem: [],
        },
        {
          id: BigInt(1),
          userId: BigInt(userId),
          status: order_status.PAID,
          total: 35000,
          OrderItem: [],
        },
      ];
      mockPrisma.order.findMany.mockResolvedValue(mockOrders);

      const result = await service.findAllByUser(userId);

      expect(result).toHaveLength(2);
      expect(mockPrisma.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: BigInt(userId) },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('hủy đơn PENDING hoàn trả nguyên liệu và cập nhật trạng thái sang CANCELLED', async () => {
      const userId = 15;
      const orderId = 601;

      mockPrisma.order.findUnique.mockResolvedValue({
        id: BigInt(orderId),
        userId: BigInt(userId),
        status: order_status.PENDING,
        OrderItem: [
          {
            id: BigInt(1),
            productId: BigInt(1),
            size: 'M',
            qty: 2,
            Product: { id: BigInt(1), stock: 8 },
          },
        ],
        Payment: [],
      });

      mockPrisma.productRecipeItem.findMany.mockResolvedValue([
        { productId: BigInt(1), size: 'M', ingredientId: 5, amount: 30 },
      ]);

      mockPrisma.order.update.mockResolvedValue({
        id: BigInt(orderId),
        userId: BigInt(userId),
        status: order_status.CANCELLED,
      });

      const cancelled = await service.cancelOrder(orderId, userId);

      expect(cancelled.status).toBe(order_status.CANCELLED);
      expect(mockPrisma.ingredient.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: { stock: { increment: 60 } },
      });
    });
  });
});
