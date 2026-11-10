import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsUUID,
  Min,
} from 'class-validator';

export enum PaymentMethod {
  WALLET = 'WALLET',
  CARD = 'CARD',
}

export class CreatePaymentDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  orderId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsUUID('4', { message: 'idempotencyKey phải là định dạng UUID v4 hợp lệ' })
  @IsNotEmpty()
  idempotencyKey: string;
}
