import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password_123'),
  compare: jest.fn().mockResolvedValue(true),
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: BigInt(1),
    fullName: 'Nguyễn Văn A',
    email: 'user@brewlite.com',
    phone: '0901234567',
    role: 'customer',
    loyaltyPoints: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('tạo người dùng mới với mật khẩu được hash bcrypt', async () => {
      mockPrismaService.user.create.mockResolvedValue(mockUser);

      const result = await service.create({
        fullName: 'Nguyễn Văn A',
        email: 'user@brewlite.com',
        phone: '0901234567',
        password: 'password123',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          fullName: 'Nguyễn Văn A',
          email: 'user@brewlite.com',
          phone: '0901234567',
          passwordHash: 'hashed_password_123',
        },
        select: expect.any(Object),
      });
    });

    it('tự động gán role barista nếu email chứa barista hoặc staff', async () => {
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        role: 'barista',
      });

      await service.create({
        fullName: 'Nhân viên Barista',
        email: 'barista@brewlite.com',
        phone: '0907654321',
        password: 'password123',
      });

      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          role: 'barista',
        }),
        select: expect.any(Object),
      });
    });

    it('ném lỗi ConflictException khi email đã tồn tại (P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.22.0',
        meta: { target: ['email'] },
      });
      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(
        service.create({
          fullName: 'Nguyễn Văn A',
          email: 'user@brewlite.com',
          phone: '0901234567',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('ném lỗi ConflictException khi số điện thoại đã tồn tại (P2002)', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '5.22.0',
        meta: { target: ['phone'] },
      });
      mockPrismaService.user.create.mockRejectedValue(prismaError);

      await expect(
        service.create({
          fullName: 'Nguyễn Văn B',
          email: 'user2@brewlite.com',
          phone: '0901234567',
          password: 'password123',
        }),
      ).rejects.toThrow('Số điện thoại đã được sử dụng');
    });
  });

  describe('findAll', () => {
    it('trả về danh sách user phân trang cùng tổng số lượng', async () => {
      mockPrismaService.$transaction.mockResolvedValue([[mockUser], 1]);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result).toEqual({
        items: [mockUser],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('trả về user nếu ID tồn tại', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.findOne(1);
      expect(result).toEqual(mockUser);
    });

    it('ném lỗi NotFoundException nếu ID không tồn tại', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('cập nhật thông tin user thành công', async () => {
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        fullName: 'Nguyễn Văn Đã Đổi Tên',
      });

      const result = await service.update(1, { fullName: 'Nguyễn Văn Đã Đổi Tên' });
      expect(result.fullName).toBe('Nguyễn Văn Đã Đổi Tên');
    });

    it('hash mật khẩu mới nếu có truyền trường password', async () => {
      mockPrismaService.user.update.mockResolvedValue(mockUser);

      await service.update(1, { password: 'newPassword123' });
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 10);
    });
  });

  describe('remove', () => {
    it('xóa người dùng thành công', async () => {
      mockPrismaService.user.delete.mockResolvedValue(mockUser);

      await expect(service.remove(1)).resolves.not.toThrow();
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('addLoyaltyPoints', () => {
    it('tích điểm loyalty cho người dùng bằng lệnh increment', async () => {
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        loyaltyPoints: 10,
      });

      const result = await service.addLoyaltyPoints(1, 10);
      expect(result.loyaltyPoints).toBe(10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { loyaltyPoints: { increment: 10 } },
        select: expect.any(Object),
      });
    });
  });
});
