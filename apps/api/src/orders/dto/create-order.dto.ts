import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

export class OrderItemDto {
  @Type(() => Number)
  @IsInt()
  productId: number;

  @IsString()
  @IsNotEmpty()
  size: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsArray()
  toppings?: string[];
}

export class CreateOrderDto {

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  voucherCode?: string;
}