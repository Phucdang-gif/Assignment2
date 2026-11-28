import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class CreateToppingDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt({ message: 'Giá topping phải là số nguyên' })
    @IsNotEmpty()
    @Min(0, { message: 'Giá topping không được nhỏ hơn 0' })
    price: number;

    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
}
