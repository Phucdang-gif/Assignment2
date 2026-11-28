import { ForbiddenException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { payment_method } from '@prisma/client';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { UsersService } from '../users/users.service';

describe('PaymentsController (Security & Guards)', () => {
  let controller: PaymentsController;
  const originalEnv = process.env;

  const mockPaymentsService = {
    create: jest.fn(),
    assertOrderAccess: jest.fn(),
    verifyPayOSPayment: jest.fn(),
    createPayOSLink: jest.fn(),
    handlePayOSWebhook: jest.fn(),
    confirmPayOSWebhookUrl: jest.fn(),
    getPaymentStatus: jest.fn(),
    createMomoPayment: jest.fn(),
    handleMomoIPN: jest.fn(),
    findByOrder: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env = { ...originalEnv };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
        {
          provide: UsersService,
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('phải được định nghĩa', () => {
    expect(controller).toBeDefined();
  });

  it('các route của khách hàng phải được bảo vệ bởi JwtAuthGuard', () => {
    const createGuards = Reflect.getMetadata('__guards__', controller.create);
    expect(createGuards).toBeDefined();
    expect(createGuards).toEqual(expect.arrayContaining([JwtAuthGuard]));

    const payosLinkGuards = Reflect.getMetadata('__guards__', controller.createPayOSLink);
    expect(payosLinkGuards).toBeDefined();
    expect(payosLinkGuards).toEqual(expect.arrayContaining([JwtAuthGuard]));

    const statusGuards = Reflect.getMetadata('__guards__', controller.getStatus);
    expect(statusGuards).toBeDefined();
    expect(statusGuards).toEqual(expect.arrayContaining([JwtAuthGuard]));

    const momoPaymentGuards = Reflect.getMetadata('__guards__', controller.createMomoPayment);
    expect(momoPaymentGuards).toBeDefined();
    expect(momoPaymentGuards).toEqual(expect.arrayContaining([JwtAuthGuard]));

    const findByOrderGuards = Reflect.getMetadata('__guards__', controller.findByOrder);
    expect(findByOrderGuards).toBeDefined();
    expect(findByOrderGuards).toEqual(expect.arrayContaining([JwtAuthGuard]));
  });

  it('các route webhook/IPN từ cổng thanh toán phải là public (không dùng JwtAuthGuard)', () => {
    const webhookGuards = Reflect.getMetadata('__guards__', controller.handlePayOSWebhook);
    expect(webhookGuards).toBeUndefined();

    const ipnGuards = Reflect.getMetadata('__guards__', controller.handleMomoIPN);
    expect(ipnGuards).toBeUndefined();
  });

  it('route cấu hình payos-confirm-url phải được bảo vệ bởi StaffOnly (JwtAuthGuard + RolesGuard)', () => {
    const confirmUrlGuards = Reflect.getMetadata('__guards__', controller.confirmPayOSWebhookUrl);
    expect(confirmUrlGuards).toBeDefined();
    expect(confirmUrlGuards).toEqual(expect.arrayContaining([JwtAuthGuard, RolesGuard]));
  });

  describe('POST /api/payments (Chặn thanh toán mô phỏng ở môi trường thực tế)', () => {
    const sampleDto = {
      orderId: 1,
      amount: 50000,
      method: payment_method.WALLET,
      idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
    };
    const sampleReq = { user: { userId: 10 } };

    it('chặn (403 Forbidden) khi chạy ở môi trường production ngay cả khi bật ALLOW_MOCK_PAYMENT=true', async () => {
      process.env.NODE_ENV = 'production';
      process.env.ALLOW_MOCK_PAYMENT = 'true';

      await expect(controller.create(sampleDto, sampleReq)).rejects.toThrow(ForbiddenException);
      expect(mockPaymentsService.assertOrderAccess).not.toHaveBeenCalled();
      expect(mockPaymentsService.create).not.toHaveBeenCalled();
    });

    it('chặn (403 Forbidden) khi chạy ở môi trường development và chưa bật ALLOW_MOCK_PAYMENT', async () => {
      process.env.NODE_ENV = 'development';
      delete process.env.ALLOW_MOCK_PAYMENT;

      await expect(controller.create(sampleDto, sampleReq)).rejects.toThrow(ForbiddenException);
      expect(mockPaymentsService.assertOrderAccess).not.toHaveBeenCalled();
      expect(mockPaymentsService.create).not.toHaveBeenCalled();
    });

    it('cho phép chạy khi ở môi trường test (NODE_ENV=test)', async () => {
      process.env.NODE_ENV = 'test';
      delete process.env.ALLOW_MOCK_PAYMENT;
      mockPaymentsService.assertOrderAccess.mockResolvedValue(undefined);
      mockPaymentsService.create.mockResolvedValue({ success: true });

      const result = await controller.create(sampleDto, sampleReq);
      expect(result).toEqual({ success: true });
      expect(mockPaymentsService.assertOrderAccess).toHaveBeenCalledWith(1, 10);
      expect(mockPaymentsService.create).toHaveBeenCalledWith(sampleDto);
    });

    it('cho phép chạy khi ở môi trường development và bật ALLOW_MOCK_PAYMENT=true', async () => {
      process.env.NODE_ENV = 'development';
      process.env.ALLOW_MOCK_PAYMENT = 'true';
      mockPaymentsService.assertOrderAccess.mockResolvedValue(undefined);
      mockPaymentsService.create.mockResolvedValue({ success: true });

      const result = await controller.create(sampleDto, sampleReq);
      expect(result).toEqual({ success: true });
      expect(mockPaymentsService.assertOrderAccess).toHaveBeenCalledWith(1, 10);
      expect(mockPaymentsService.create).toHaveBeenCalledWith(sampleDto);
    });

    it('cho phép hoàn tất đơn hàng 0đ ở môi trường production (đối chiếu tổng tiền DB)', async () => {
      process.env.NODE_ENV = 'production';
      delete process.env.ALLOW_MOCK_PAYMENT;
      const freeDto = { ...sampleDto, amount: 0 };
      mockPaymentsService.assertOrderAccess.mockResolvedValue(undefined);
      mockPaymentsService.create.mockResolvedValue({ success: true });

      const result = await controller.create(freeDto, sampleReq);
      expect(result).toEqual({ success: true });
      expect(mockPaymentsService.assertOrderAccess).toHaveBeenCalledWith(1, 10);
      expect(mockPaymentsService.create).toHaveBeenCalledWith(freeDto);
    });
  });
});
