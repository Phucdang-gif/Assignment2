import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesService } from './categories.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';

describe('CategoriesService', () => {
  let service: CategoriesService;

  const mockCategory = {
    id: 1,
    name: 'Cà phê',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('trả về danh sách danh mục sắp xếp theo tên', async () => {
      mockPrismaService.category.findMany.mockResolvedValue([mockCategory]);

      const result = await service.findAll();
      expect(result).toEqual([mockCategory]);
      expect(mockPrismaService.category.findMany).toHaveBeenCalledWith({
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findOne', () => {
    it('trả về thông tin danh mục nếu ID tồn tại', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);

      const result = await service.findOne(1);
      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('ném lỗi NotFoundException nếu ID không tồn tại', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('tạo danh mục mới thành công', async () => {
      mockPrismaService.category.create.mockResolvedValue(mockCategory);

      const result = await service.create({ name: 'Cà phê' });
      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.create).toHaveBeenCalledWith({
        data: { name: 'Cà phê' },
      });
    });

    it('ném lỗi ConflictException khi tên danh mục đã tồn tại (P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.22.0',
      });
      mockPrismaService.category.create.mockRejectedValue(prismaError);

      await expect(service.create({ name: 'Cà phê' })).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('cập nhật danh mục thành công', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.update.mockResolvedValue({
        ...mockCategory,
        name: 'Trà trái cây',
      });

      const result = await service.update(1, { name: 'Trà trái cây' });
      expect(result.name).toBe('Trà trái cây');
    });

    it('ném lỗi NotFoundException khi cập nhật danh mục không tồn tại', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Mới' })).rejects.toThrow(NotFoundException);
    });

    it('ném lỗi ConflictException khi đổi tên sang tên đã tồn tại', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.22.0',
      });
      mockPrismaService.category.update.mockRejectedValue(prismaError);

      await expect(service.update(1, { name: 'Trà sữa' })).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('xóa danh mục thành công', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.category.delete.mockResolvedValue(mockCategory);

      const result = await service.remove(1);
      expect(result).toEqual(mockCategory);
      expect(mockPrismaService.category.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('ném lỗi NotFoundException khi xóa danh mục không tồn tại', async () => {
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
