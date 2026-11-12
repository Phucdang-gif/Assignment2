import { Test, TestingModule } from '@nestjs/testing';
import { ToppingsService } from './toppings.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ToppingsService', () => {
  let service: ToppingsService;
  let mockPrisma: any;

  const mockToppings = [
    { id: 1, name: 'Trân châu đen hoàng gia', price: 10000, isAvailable: true },
    { id: 2, name: 'Thạch củ năng', price: 8000, isAvailable: true },
    { id: 3, name: 'Kem cheese Macchiato', price: 12000, isAvailable: false },
  ];

  beforeEach(async () => {
    mockPrisma = {
      topping: {
        findMany: jest.fn().mockImplementation(({ where }) => {
          if (where?.isAvailable) {
            return Promise.resolve(mockToppings.filter((t) => t.isAvailable));
          }
          return Promise.resolve(mockToppings);
        }),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          const found = mockToppings.find((t) => t.id === where.id);
          return Promise.resolve(found || null);
        }),
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({ id: 4, ...data }),
        ),
        update: jest.fn().mockImplementation(({ where, data }) =>
          Promise.resolve({ ...mockToppings.find((t) => t.id === where.id), ...data }),
        ),
        delete: jest.fn().mockImplementation(({ where }) =>
          Promise.resolve(mockToppings.find((t) => t.id === where.id)),
        ),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ToppingsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ToppingsService>(ToppingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll (FR-02 / AC-02.2)', () => {
    it('lấy danh sách các topping đang khả dụng (isAvailable: true)', async () => {
      const toppings = await service.findAll();
      expect(toppings).toHaveLength(2);
      expect(toppings.every((t) => t.isAvailable)).toBe(true);
      expect(mockPrisma.topping.findMany).toHaveBeenCalledWith({
        where: { isAvailable: true },
        orderBy: { id: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('lấy chi tiết topping theo id', async () => {
      const topping = await service.findOne(1);
      expect(topping).toBeDefined();
      expect(topping?.name).toBe('Trân châu đen hoàng gia');
    });

    it('trả về null nếu không tìm thấy topping', async () => {
      const topping = await service.findOne(999);
      expect(topping).toBeNull();
    });
  });

  describe('create', () => {
    it('tạo topping mới thành công', async () => {
      const newTopping = await service.create({
        name: 'Trân châu trắng',
        price: 10000,
        isAvailable: true,
      });
      expect(newTopping.id).toBeDefined();
      expect(newTopping.name).toBe('Trân châu trắng');
      expect(mockPrisma.topping.create).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('cập nhật thông tin topping thành công', async () => {
      const updated = await service.update(1, { price: 12000 });
      expect(updated.price).toBe(12000);
      expect(mockPrisma.topping.update).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('xóa topping thành công', async () => {
      const removed = await service.remove(1);
      expect(removed.id).toBe(1);
      expect(mockPrisma.topping.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });
});
