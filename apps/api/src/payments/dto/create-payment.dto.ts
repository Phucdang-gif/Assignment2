import { IsEnum, IsInt, IsNotEmpty, IsUUID, Min } from 'class-validator';
import { payment_method } from '@prisma/client';

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  orderId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @IsEnum(payment_method, {
    message: 'Phương thức thanh toán phải là WALLET hoặc CARD',
  })
  method: payment_method;

  @IsUUID('4', { message: 'idempotencyKey phải là định dạng UUID v4 hợp lệ' })
  @IsNotEmpty()
  idempotencyKey: string;
}
