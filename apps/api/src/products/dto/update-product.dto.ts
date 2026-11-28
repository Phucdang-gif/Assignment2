import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsInt, IsString, Matches, MaxLength, Min, ValidateIf } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['imageUrl', 'description', 'categoryId'] as const),
) {
  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString({ message: 'URL hình ảnh phải là chuỗi' })
  @MaxLength(500, { message: 'URL hình ảnh không được vượt quá 500 ký tự' })
  @Matches(/^(https?:\/\/\S+|\/\S+)$/, { message: 'Định dạng URL không hợp lệ' })
  imageUrl?: string | null;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsString({ message: 'Mô tả sản phẩm phải là chuỗi' })
  description?: string | null;

  @ValidateIf((_, value) => value !== null && value !== undefined)
  @IsInt({ message: 'Danh mục sản phẩm không hợp lệ' })
  @Min(1, { message: 'Danh mục sản phẩm không hợp lệ' })
  categoryId?: number | null;
}
