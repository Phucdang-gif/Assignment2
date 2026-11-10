import { Injectable } from '@nestjs/common';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ToppingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createToppingDto: CreateToppingDto) {
    return this.prisma.topping.create({
      data: createToppingDto,
    });
  }

  async findAll() {
    return this.prisma.topping.findMany({
      where: { isAvailable: true },
      orderBy: { id: 'asc' },
    });
  }

  async findOne(id: number) {
    return this.prisma.topping.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateToppingDto: UpdateToppingDto) {
    return this.prisma.topping.update({
      where: { id },
      data: updateToppingDto,
    });
  }

  async remove(id: number) {
    return this.prisma.topping.delete({
      where: { id },
    });
  }
}
