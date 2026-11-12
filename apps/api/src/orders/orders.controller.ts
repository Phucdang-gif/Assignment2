import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { order_status } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrdersService } from './orders.service';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.ordersService.create(createOrderDto, Number(req.user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: { user: { userId: number; email: string } }) {
    return this.ordersService.findAllByUser(Number(req.user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  findMyOrders(@Request() req: { user: { userId: number; email: string } }) {
    return this.ordersService.findAllByUser(Number(req.user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Get('barista/queue')
  getBaristaQueue(
    @Request() req: { user: { userId: number; email: string; role?: string } },
  ) {
    return this.ordersService.findBaristaQueue(Number(req.user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  updateOrderStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.ordersService.baristaUpdateStatus(
      id,
      updateOrderStatusDto.status,
      Number(req.user.userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('barista/:id/prepare')
  prepareOrder(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.ordersService.baristaUpdateStatus(
      id,
      order_status.PREPARING,
      Number(req.user.userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('barista/:id/ready')
  readyOrder(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.ordersService.baristaUpdateStatus(
      id,
      order_status.READY,
      Number(req.user.userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('barista/:id/complete')
  completeOrder(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.ordersService.baristaUpdateStatus(
      id,
      order_status.COMPLETED,
      Number(req.user.userId),
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.ordersService.cancelOrder(id, Number(req.user.userId));
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/retry')
  retryPayment(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string } },
  ) {
    return this.ordersService.retryPayment(id, Number(req.user.userId));
  }

  @Get('statuses')
  getOrderStatuses() {
    return this.ordersService.getOrderStatuses();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: { user: { userId: number; email: string; role?: string } },
  ) {
    return this.ordersService.findOneForUser(id, Number(req.user.userId));
  }
}