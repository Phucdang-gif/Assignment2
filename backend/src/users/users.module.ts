import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // để AuthModule dùng lại (register/login) thay vì gọi Prisma riêng
})
export class UsersModule {}
