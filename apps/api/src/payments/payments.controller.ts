import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { VerifyPayOSDto } from './dto/verify-payos.dto';
import { CreatePayOSLinkDto } from './dto/create-payos-link.dto';
import { CreateMomoLinkDto } from './dto/create-momo-link.dto';

@Controller('api/payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  /**
   * API Thanh toán Ví/Thẻ mô phỏng với cơ chế Idempotency Key
   */
  @Post()
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Post(['payos-verify', 'verify-payos'])
  @UsePipes(new ValidationPipe({ whitelist: false, forbidNonWhitelisted: false, transform: true }))
  verifyPayOSPayment(@Body() body: VerifyPayOSDto) {
    return this.paymentsService.verifyPayOSPayment(body);
  }

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

  @Get('status/:orderId')
  getStatus(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentsService.getPaymentStatus(orderId);
  }

  @Post('momo-payment')
  createMomoPayment(@Body() body: CreateMomoLinkDto) {
    return this.paymentsService.createMomoPayment(Number(body.orderId));
  }

  @Post('momo-ipn')
  @HttpCode(HttpStatus.OK)
  handleMomoIPN(@Body() body: any) {
    return this.paymentsService.handleMomoIPN(body);
  }

  @Get('order/:orderId')
  findByOrder(@Param('orderId', ParseIntPipe) orderId: number) {
    return this.paymentsService.findByOrder(orderId);
  }
}
