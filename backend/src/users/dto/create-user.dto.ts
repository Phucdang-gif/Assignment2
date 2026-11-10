import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Matches, IsOptional } from 'class-validator';

export class CreateUserDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsNotEmpty({ message: 'Vui lòng nhập email' })
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @Matches(/@(gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|icloud\.com|.+\.edu\.vn)$/, {
  message: 'Chỉ hỗ trợ email Gmail, Yahoo, Outlook, Hotmail, iCloud hoặc .edu.vn',
  })
  @MaxLength(255)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
  @MaxLength(30, { message: 'Mật khẩu tối đa 30 ký tự' })
  password: string;

  @Transform(({ value }) => typeof value === 'string' ? value.trim().replace(/\s+/g, ' ') : value)
  @IsString() @IsNotEmpty({ message: 'Vui lòng nhập họ tên' })
  @MinLength(2, { message: 'Tên tối thiểu 2 ký tự' })
  @MaxLength(100)
  @Matches(/^[\p{L}\s'.-]+$/u, { message: 'Họ tên chỉ gồm chữ cái' })
  fullName: string;

  @Transform(({ value }) => typeof value === 'string' ? value.replace(/[\s.-]/g, '') : value)
  @Matches(/^(0|\+84)(3|5|7|8|9)\d{8}$/, { message: 'Số điện thoại không hợp lệ (VD: 0912345678)' })
  phone: string;
}