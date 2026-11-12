import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePayOSLinkDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @IsString()
  @IsOptional()
  returnUrl?: string;

  @IsString()
  @IsOptional()
  cancelUrl?: string;
}
