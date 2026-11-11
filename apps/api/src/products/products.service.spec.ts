import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  const mockProduct = {
    id: BigInt(1),
    name: 'Cà phê Đen Đá',
    price: 25000,
    categoryId: 1,
    status: 'active',
    category: { id: 1, name: 'Cà phê' },
  };

  const mockPrismaService = {
    product: {
      findMany: jest.fn().mockResolvedValue([mockProduct]),
      findUnique: jest.fn().mockImplementation(({ where }) => {
        if (where.id === 1) {
          return Promise.resolve(mockProduct);
        }
        return Promise.resolve(null);
      }),
      create: jest.fn().mockResolvedValue(mockProduct),
      update: jest.fn().mockResolvedValue({ ...mockProduct, status: 'inactive' }),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll [API-T01]', () => {
    it('should return an array of active products with categories', async () => {
      const result = await service.findAll();
      expect(result).toEqual([mockProduct]);
      expect(prisma.product.findMany).toHaveBeenCalledWith({
        where: { status: 'active' },
        orderBy: { createdAt: 'asc' },
        include: { category: true },
      });
    });
  });

  describe('findOne', () => {
    it('should return a single product by ID', async () => {
      const result = await service.findOne(1);
      expect(result).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { category: true },
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new product', async () => {
      const dto = {
        name: 'Cà phê Đen Đá',
        price: 25000,
        categoryId: 1,
      };
      const result = await service.create(dto as any);
      expect(result).toEqual(mockProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: dto,
        include: { category: true },
      });
    });
  });
});
