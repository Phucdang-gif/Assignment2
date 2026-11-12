import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

function createFakeUsersService() {
  const users: { id: number; email: string; passwordHash: string; loyaltyPoints: number }[] = [];
  let nextId = 1;
  const bcrypt = require('bcrypt');

  return {
    async create(dto: { email: string; password: string }) {
      if (users.find((u) => u.email === dto.email)) {
        throw new ConflictException('Email đã được sử dụng');
      }
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = { id: nextId++, email: dto.email, passwordHash, loyaltyPoints: 0 };
      users.push(user);
      return { id: user.id, email: user.email };
    },
    async findByEmailWithHash(email: string) {
      return users.find((u) => u.email === email) ?? null;
    },
  } as unknown as UsersService;
}

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(createFakeUsersService(), new JwtService({ secret: 'test-secret' }));
  });

  it('đăng ký: mật khẩu được băm, không lưu bản gốc', async () => {
    await service.register({ email: 'a@test.com', password: 'Abc12345' } as any);
    const saved = await (service as any).usersService.findByEmailWithHash('a@test.com');
    expect(saved.passwordHash).toBeDefined();
    expect(saved.passwordHash).not.toBe('Abc12345');
  });

  it('đăng ký trùng email -> ConflictException', async () => {
    await service.register({ email: 'a@test.com', password: 'Abc12345' } as any);
    await expect(
      service.register({ email: 'a@test.com', password: 'Abc12345' } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('đăng nhập đúng -> trả về access_token', async () => {
    await service.register({ email: 'a@test.com', password: 'Abc12345' } as any);
    const result = await service.login({ email: 'a@test.com', password: 'Abc12345' } as any);
    expect(result.access_token).toEqual(expect.any(String));
  });

  it('đăng nhập sai mật khẩu hoặc email không tồn tại -> UnauthorizedException', async () => {
    await service.register({ email: 'a@test.com', password: 'Abc12345' } as any);
    await expect(
      service.login({ email: 'a@test.com', password: 'sai' } as any),
    ).rejects.toThrow(UnauthorizedException);
    await expect(
      service.login({ email: 'khong-co@test.com', password: 'Abc12345' } as any),
    ).rejects.toThrow(UnauthorizedException);
  });
});
