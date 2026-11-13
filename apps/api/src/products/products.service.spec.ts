import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;

  const mockProduct = {
    id: BigInt(1),
    name: 'Cà phê Đen Đá',
    price: 25000,
    categoryId: 1,
    status: 'active',
    category: { id: 1, name: 'Cà phê' },
    ProductRecipeItem: [
      {
        id: 1,
        productId: BigInt(1),
        size: 'M' as const,
        ingredientId: 1,
        amount: 25,
        unit: 'g',
        Ingredient: {
          id: 1,
          name: 'Cà phê Robusta',
          unit: 'g',
          stock: 500,
        },
      },
    ],
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
    productRecipeItem: {
      findMany: jest.fn().mockResolvedValue(mockProduct.ProductRecipeItem),
    },
    ingredient: {
      update: jest.fn().mockResolvedValue({}),
    },
    $transaction: jest.fn().mockImplementation((actions) => Promise.all(actions)),
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
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateStock', () => {
    it('should calculate correct stock based on recipe items and ingredient stocks', () => {
      const stock = service.calculateStock(mockProduct.ProductRecipeItem as any);
      expect(stock).toBe(20); // 500g / 25g = 20 ly
    });

    it('should return 0 when recipes are empty or ingredients are depleted', () => {
      expect(service.calculateStock([])).toBe(0);
      const depletedRecipes = [
        {
          ...mockProduct.ProductRecipeItem[0],
          Ingredient: { id: 1, name: 'Cà phê', unit: 'g', stock: 10 }, // 10g < 25g
        },
      ];
      expect(service.calculateStock(depletedRecipes as any)).toBe(0);
    });
  });

  describe('findAll', () => {
    it('should return active products with dynamically calculated stock', async () => {
      const result = await service.findAll();
      expect(result).toHaveLength(1);
      expect(result[0].stock).toBe(20);
      expect(mockPrismaService.product.findMany).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single product with calculated stock and sizeStock', async () => {
      const result = await service.findOne(1);
      expect(result.stock).toBe(20);
      expect(result.sizeStock).toBeDefined();
      expect(result.sizeStock.M).toBe(20);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: {
          category: true,
          ProductRecipeItem: {
            include: { Ingredient: true },
          },
        },
      });
    });

    it('should throw NotFoundException if product is not found', async () => {
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('deductIngredients', () => {
    it('should deduct ingredients when enough stock is available', async () => {
      await service.deductIngredients(1, 'M', 2);
      expect(mockPrismaService.productRecipeItem.findMany).toHaveBeenCalled();
      expect(mockPrismaService.$transaction).toHaveBeenCalled();
    });

    it('should throw BadRequestException if ingredient stock is insufficient', async () => {
      // 500g available, order 30 cups * 25g = 750g -> insufficient
      await expect(service.deductIngredients(1, 'M', 30)).rejects.toThrow(BadRequestException);
    });
  });
});
