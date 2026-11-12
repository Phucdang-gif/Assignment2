import { IsNotEmpty, IsOptional } from 'class-validator';

export class VerifyPayOSDto {
  @IsNotEmpty()
  orderId: number | string;

  @IsOptional()
  orderCode?: number | string;

  @IsOptional()
  status?: string;

  @IsOptional()
  code?: string;
}
