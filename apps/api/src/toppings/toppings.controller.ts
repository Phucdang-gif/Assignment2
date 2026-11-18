import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ToppingsService } from './toppings.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { StaffOnly } from '../auth/roles.guard';

@Controller('api/toppings')
export class ToppingsController {
  constructor(private readonly toppingsService: ToppingsService) {}

  @StaffOnly()
  @Post()
  create(@Body() createToppingDto: CreateToppingDto) {
    return this.toppingsService.create(createToppingDto);
  }

  @Get()
  findAll() {
    return this.toppingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.toppingsService.findOne(id);
  }

  @StaffOnly()
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateToppingDto: UpdateToppingDto) {
    return this.toppingsService.update(id, updateToppingDto);
  }

  @StaffOnly()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.toppingsService.remove(id);
  }
}
