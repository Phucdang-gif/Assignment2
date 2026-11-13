import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  controllers: [UsersController],
  providers: [UsersService, RolesGuard],
  exports: [UsersService, RolesGuard], // để AuthModule dùng lại (register/login) thay vì gọi Prisma riêng
})
export class UsersModule {}
