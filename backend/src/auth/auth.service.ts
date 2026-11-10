import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailWithHash(dto.email);
    const isMatch = user ? await bcrypt.compare(dto.password, user.passwordHash) : false;

    if (!user || !isMatch) {
      throw new UnauthorizedException('Sai email hoặc mật khẩu');
    }

    const payload = { sub: Number(user.id), email: user.email, role: (user as any).role };
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: Number(user.id),
        email: user.email,
        role: (user as any).role,
        loyaltyPoints: user.loyaltyPoints,
      },
    };
  }
}
