import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPayOSDto } from './dto/verify-payos.dto';
import { CreatePayOSLinkDto } from './dto/create-payos-link.dto';
import { CreateMomoLinkDto } from './dto/create-momo-link.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

type AuthReq = { user: { userId: number } };

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * API Thanh toán Ví/Thẻ mô phỏng với cơ chế Idempotency Key
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() dto: CreatePaymentDto, @Request() req: AuthReq) {
    await this.paymentsService.assertOrderAccess(dto.orderId, Number(req.user.userId));
    return this.paymentsService.create(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['payos-verify', 'verify-payos'])
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: true }))
  async verifyPayOSPayment(@Body() body: VerifyPayOSDto, @Request() req: AuthReq) {
    await this.paymentsService.assertOrderAccess(Number(body.orderId), Number(req.user.userId));
    return this.paymentsService.verifyPayOSPayment(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['payos-link', 'create-payos-link'])
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: true }))
  async createPayOSLink(@Body() body: CreatePayOSLinkDto, @Request() req: AuthReq) {
  await this.paymentsService.assertOrderAccess(Number(body.orderId), Number(req.user.userId));
  return this.paymentsService.createPayOSLink(Number(body.orderId), body);
}

  @Post('payos-webhook')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
  handlePayOSWebhook(@Body() body: any) {
    return this.paymentsService.handlePayOSWebhook(body);
  }

  @Post('payos-confirm-url')
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false }))
  confirmPayOSWebhookUrl(@Body() body: { webhookUrl: string }) {
    return this.paymentsService.confirmPayOSWebhookUrl(body.webhookUrl);
  }

  @UseGuards(JwtAuthGuard)
  @Get('status/:orderId')
  async getStatus(@Param('orderId', ParseIntPipe) orderId: number, @Request() req: AuthReq) {
    await this.paymentsService.assertOrderAccess(orderId, Number(req.user.userId), true);
    return this.paymentsService.getPaymentStatus(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('momo-payment')
  async createMomoPayment(@Body() body: CreateMomoLinkDto, @Request() req: AuthReq) {
    await this.paymentsService.assertOrderAccess(Number(body.orderId), Number(req.user.userId));
    return this.paymentsService.createMomoPayment(Number(body.orderId));
  }

  @Post('momo-ipn')
  @HttpCode(HttpStatus.OK)
  handleMomoIPN(@Body() body: any) {
    return this.paymentsService.handleMomoIPN(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  async findByOrder(@Param('orderId', ParseIntPipe) orderId: number, @Request() req: AuthReq) {
    await this.paymentsService.assertOrderAccess(orderId, Number(req.user.userId), true);
    return this.paymentsService.findByOrder(orderId);
  }
}
