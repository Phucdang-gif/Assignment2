import { IsString, IsNotEmpty, MaxLength, IsInt, Min, IsOptional, IsUrl, IsEnum } from 'class-validator';
import { ProductStatus } from '@prisma/client';
export class CreateProductDto {
  @IsString({ message: 'Tên sản phẩm phải là chuỗi' })
  @IsNotEmpty({ message: 'Tên sản phẩm không được để trống' })
  @MaxLength(255, { message: 'Tên sản phẩm không được vượt quá 255 ký tự' })
  name: string;

  @IsInt({ message: 'Giá sản phẩm phải là số nguyên' })
  @IsNotEmpty({ message: 'Giá sản phẩm không được để trống' })
  @Min(0, { message: 'Giá sản phẩm không được nhỏ hơn 0' })
  price: number;

  @IsOptional()
  @IsString({ message: 'URL hình ảnh phải là chuỗi' })
  @MaxLength(500, { message: 'URL hình ảnh không được vượt quá 500 ký tự' })
  @IsUrl({}, { message: 'Định dạng URL không hợp lệ' })
  imageUrl?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả sản phẩm phải là chuỗi' })
  description?: string;

  @IsOptional()
  @IsInt({ message: 'Số lượng tồn kho phải là số nguyên' })
  @Min(0, { message: 'Số lượng tồn kho không được nhỏ hơn 0' })
  stock?: number;

  @IsOptional()
  @IsEnum(ProductStatus, { message: 'Trạng thái sản phẩm không hợp lệ' })
  status?: ProductStatus;

  @IsOptional()
  @IsInt({ message: 'Danh mục sản phẩm không hợp lệ' })
  @Min(1, { message: 'Danh mục sản phẩm không hợp lệ' })
  categoryId?: number;
}
