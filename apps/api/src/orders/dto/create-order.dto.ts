import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderItemDto {
  @Type(() => Number)
  @IsInt()
  productId: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(['S', 'M', 'L'], { message: 'Size sản phẩm phải là S, M hoặc L' })
  size: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  qty: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsArray()
  toppings?: string[];
}

export class CreateOrderDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Đơn hàng phải có ít nhất một sản phẩm' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @IsOptional()
  @IsString()
  voucherCode?: string;
}