import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreatePayOSLinkDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;
}
