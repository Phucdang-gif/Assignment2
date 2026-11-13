import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  applyDecorators,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const STAFF_ROLES = ['barista', 'admin'] as const;

export const isStaffRole = (role?: string | null): boolean =>
  !!role && (STAFF_ROLES as readonly string[]).includes(role);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.userId) {
      throw new ForbiddenException('Không có thông tin xác thực');
    }

    const dbUser = await this.usersService.findOne(Number(user.userId));
    if (!dbUser) {
      throw new ForbiddenException('Người dùng không tồn tại');
    }

    const userRole = (dbUser as any).role;
    const hasRole = requiredRoles.includes(userRole);

    if (!hasRole) {
      throw new ForbiddenException('Bạn không có quyền truy cập chức năng này');
    }

    return true;
  }
}

export const StaffOnly = () =>
  applyDecorators(UseGuards(JwtAuthGuard, RolesGuard), Roles(...STAFF_ROLES));