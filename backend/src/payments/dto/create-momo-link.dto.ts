import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMomoLinkDto {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;
}