import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ToppingsService } from './toppings.service';
import { CreateToppingDto } from './dto/create-topping.dto';
import { UpdateToppingDto } from './dto/update-topping.dto';
import { AdminOnly } from '../auth/roles.guard';

@Controller('api/toppings')
export class ToppingsController {
  constructor(private readonly toppingsService: ToppingsService) {}

  @AdminOnly()
  @Post()
  create(@Body() createToppingDto: CreateToppingDto) {
    return this.toppingsService.create(createToppingDto);
  }

  @Get()
  findAll() {
    return this.toppingsService.findAll();
  }

  @AdminOnly()
  @Get('admin/all')
  findAllAdmin() {
    return this.toppingsService.findAllAdmin();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.toppingsService.findOne(id);
  }

  @AdminOnly()
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() updateToppingDto: UpdateToppingDto) {
    return this.toppingsService.update(id, updateToppingDto);
  }

  @AdminOnly()
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.toppingsService.remove(id);
  }
}
