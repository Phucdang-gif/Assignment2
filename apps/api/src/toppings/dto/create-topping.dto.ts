import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsString} from "class-validator";

export class CreateToppingDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @IsNotEmpty()
    price: number;

    @IsOptional()
    @IsBoolean()
    isAvailable?: boolean;
}
