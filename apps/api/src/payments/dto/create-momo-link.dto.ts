import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateMomoLinkDto {
  @IsNumber()
  @IsNotEmpty()
  orderId: number;
}
