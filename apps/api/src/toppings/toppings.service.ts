import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ToppingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createToppingDto: CreateToppingDto) {
    try {
      return await this.prisma.topping.create({
        data: createToppingDto,
      });
    } catch (e) {
      this.handleError(e);
    }
  }

  async findAll() {
    return this.prisma.topping.findMany({
      where: { isAvailable: true },
      orderBy: { id: 'asc' },
    });
  }

  async findAllAdmin() {
    return this.prisma.topping.findMany({
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.topping.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateToppingDto: UpdateToppingDto) {
    try {
      return await this.prisma.topping.update({
        where: { id },
        data: updateToppingDto,
      });
    } catch (e) {
      this.handleError(e, id);
    }
  }

  async remove(id: number) {
    try {
      return await this.prisma.topping.delete({
        where: { id },
      });
    } catch (e) {
      this.handleError(e, id);
    }
  }

  private handleError(e: unknown, id?: number): never {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        throw new ConflictException('Tên topping đã tồn tại');
      }
      if (e.code === 'P2003') {
        throw new ConflictException(
          'Không thể xóa topping này vì đã xuất hiện trong lịch sử đơn hàng. Vui lòng chuyển sang trạng thái "Tạm hết" thay vì xóa.',
        );
      }
      if (e.code === 'P2025') {
        throw new NotFoundException(`Topping #${id} không tồn tại`);
      }
    }
    throw e;
  }
}
