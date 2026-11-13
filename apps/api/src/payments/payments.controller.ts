import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
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

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * API Thanh toán Ví/Thẻ mô phỏng với cơ chế Idempotency Key
   */
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['payos-verify', 'verify-payos'])
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: true }))
  verifyPayOSPayment(@Body() body: VerifyPayOSDto) {
    return this.paymentsService.verifyPayOSPayment(body);
  }

  @UseGuards(JwtAuthGuard)
  @Post(['payos-link', 'create-payos-link'])
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: true }))
  createPayOSLink(@Body() body: CreatePayOSLinkDto) {
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
  getStatus(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentsService.getPaymentStatus(orderId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('momo-payment')
  createMomoPayment(@Body() body: CreateMomoLinkDto) {
    return this.paymentsService.createMomoPayment(Number(body.orderId));
  }

  @Post('momo-ipn')
  @HttpCode(HttpStatus.OK)
  handleMomoIPN(@Body() body: any) {
    return this.paymentsService.handleMomoIPN(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  findByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentsService.findByOrder(orderId);
  }
}
