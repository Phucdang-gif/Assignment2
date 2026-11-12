import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { order_status, payment_method, payment_status } from '@prisma/client';

describe('PaymentsService', () => {
  let service: PaymentsService;

  const mockOrder = {
    id: BigInt(4),
    userId: BigInt(2),  
    status: order_status.PENDING,
    total: 103500,
    User: { id: BigInt(2), loyaltyPoints: 50 },
    OrderItem: [
      {
        id: BigInt(1),
        orderId: BigInt(4),
        productId: BigInt(1),
        size: 'M',
        qty: 2,
        Product: { id: BigInt(1), name: 'Cà phê sữa đá' },
        OrderItemTopping: [],
      },
    ],
    Payment: [],
  };

  const mockPayment = {
    id: BigInt(1),
    orderId: BigInt(4),
    idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
    amount: 103500,
    method: payment_method.WALLET,
    status: payment_status.SUCCESS,
    transactionRef: null,
    createdAt: new Date(),
  };

  const mockPrismaService = {
    order: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
    },
    user: {
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create (FR-06 / INT-T03: Payment processing)', () => {
    it('should successfully process payment and transition order to PAID', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.payment.findFirst.mockResolvedValue(null);
      mockPrismaService.payment.create.mockResolvedValue(mockPayment);

      const paidOrder = { ...mockOrder, status: order_status.PAID, Payment: [mockPayment] };
      mockPrismaService.order.update.mockResolvedValue(paidOrder);

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        return callback(mockPrismaService);
      });
      mockPrismaService.user.update.mockResolvedValue({ id: BigInt(2), loyaltyPoints: 60 });

      const result = await service.create({
        orderId: 4,
        amount: 103500,
        method: payment_method.WALLET,
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.order?.status).toBe(order_status.PAID);
      expect(result.payment).toBeDefined();
      expect(result.pointsEarned).toBe(10); // 103,500 / 10,000 = 10 points
      expect(mockPrismaService.payment.create).toHaveBeenCalled();
      expect(mockPrismaService.order.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          orderId: 999,
          amount: 50000,
          method: payment_method.WALLET,
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440001',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if order is already PAID', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: order_status.PAID,
      });

      await expect(
        service.create({
          orderId: 4,
          amount: 103500,
          method: payment_method.CARD,
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440002',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if order was CANCELLED', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: order_status.CANCELLED,
      });

      await expect(
        service.create({
          orderId: 4,
          amount: 103500,
          method: payment_method.WALLET,
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440003',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if amount does not match order total', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(null);
      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.create({
          orderId: 4,
          amount: 90000, // mismatch from 103500
          method: payment_method.WALLET,
          idempotencyKey: '550e8400-e29b-41d4-a716-446655440004',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('Idempotency Key mechanism (INT-T04 / ADR-004)', () => {
    it('should return existing payment when idempotencyKey already exists without duplicate payment', async () => {
      mockPrismaService.payment.findUnique.mockResolvedValue(mockPayment);
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: order_status.PAID,
      });

      const result = await service.create({
        orderId: 4,
        amount: 103500,
        method: payment_method.WALLET,
        idempotencyKey: '550e8400-e29b-41d4-a716-446655440000',
      });

      expect(result.idempotent).toBe(true);
      expect(result.payment).toEqual(mockPayment);
      expect(mockPrismaService.payment.create).not.toHaveBeenCalled();
      expect(mockPrismaService.order.update).not.toHaveBeenCalled();
    });
  });

  describe('getPaymentStatus', () => {
    it('should return status of existing order', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue({
        ...mockOrder,
        status: order_status.PAID,
        Payment: [mockPayment],
      });

      const result = await service.getPaymentStatus(4);
      expect(result.orderId).toBe(4);
      expect(result.isPaid).toBe(true);
      expect(result.status).toBe(order_status.PAID);
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);
      await expect(service.getPaymentStatus(999)).rejects.toThrow(NotFoundException);
    });
  });
});
