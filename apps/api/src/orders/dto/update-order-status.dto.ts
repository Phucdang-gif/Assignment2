import { IsEnum, IsNotEmpty } from 'class-validator';
import { order_status } from '@prisma/client';

export class UpdateOrderStatusDto {
  @IsNotEmpty()
  @IsEnum(order_status, {
    message:
      'Trạng thái đơn hàng không hợp lệ. Phải thuộc một trong các trạng thái: PENDING, PAID, PREPARING, READY, COMPLETED, PAYMENT_FAILED, CANCELLED',
  })
  status: order_status;
}
