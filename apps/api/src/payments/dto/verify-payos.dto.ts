import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class VerifyPayOSDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsOptional()
  orderCode?: number | string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  code?: string;
}
