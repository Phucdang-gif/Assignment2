import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { product_size } from '@prisma/client';

export type RecipeWithIngredient = {
  id: number;
  productId: bigint;
  size: product_size;
  ingredientId: number;
  amount: number;
  unit: string;
  Ingredient: {
    id: number;
    name: string;
    unit: string;
    stock: number;
  };
};

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tính toán số lượng thành phẩm có thể pha chế dựa trên công thức và tồn kho nguyên liệu.
   * Nếu có chỉ định targetSize, tính cho kích cỡ đó.
   * Nếu không chỉ định, tính số lượng tối đa khả dụng (min giữa các kích cỡ).
   */
  calculateStock(recipes?: RecipeWithIngredient[], targetSize?: product_size): number {
    if (!recipes || recipes.length === 0) return 0;

    if (targetSize) {
      const itemsForSize = recipes.filter((r) => r.size === targetSize);
      if (itemsForSize.length === 0) return 0;
      let minQty = Infinity;
      for (const item of itemsForSize) {
        if (item.amount <= 0) continue;
        const ingStock = item.Ingredient?.stock ?? 0;
        const available = Math.floor(ingStock / item.amount);
        if (available < minQty) minQty = available;
      }
      return minQty === Infinity ? 0 : minQty;
    }

    const sizes = Array.from(new Set(recipes.map((r) => r.size)));
    if (sizes.length === 0) return 0;
    const capacities = sizes.map((s) => this.calculateStock(recipes, s));
    return Math.min(...capacities);
  }

  async create(createProductDto: CreateProductDto) {
    const product = await this.prisma.product.create({
      data: createProductDto,
      include: { category: true },
    });
    return {
      ...product,
      stock: 0,
    };
  }

  async findAll() {
    const products = await this.prisma.product.findMany({
      where: { status: 'active' },
      orderBy: { createdAt: 'asc' },
      include: {
        category: true,
        ProductRecipeItem: {
          include: {
            Ingredient: true,
          },
        },
      },
    });

    return products.map((p) => ({
      ...p,
      stock: this.calculateStock(p.ProductRecipeItem as any),
    }));
  }

  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        ProductRecipeItem: {
          include: {
            Ingredient: true,
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Không tìm thấy sản phẩm với ID: ${id}`);
    }
    const recipes = product.ProductRecipeItem as any;
    return {
      ...product,
      stock: this.calculateStock(recipes),
      sizeStock: {
        S: this.calculateStock(recipes, 'S'),
        M: this.calculateStock(recipes, 'M'),
        L: this.calculateStock(recipes, 'L'),
      },
    };
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    await this.findOne(id);
    const updated = await this.prisma.product.update({
      where: { id },
      data: updateProductDto,
      include: {
        category: true,
        ProductRecipeItem: {
          include: {
            Ingredient: true,
          },
        },
      },
    });
    return {
      ...updated,
      stock: this.calculateStock(updated.ProductRecipeItem as any),
    };
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: { status: 'inactive' },
    });
  }

  /**
   * Trừ nguyên liệu theo công thức pha chế khi đơn hàng được thực hiện
   */
  async deductIngredients(productId: number | bigint, size: product_size, qty: number) {
    const recipes = await this.prisma.productRecipeItem.findMany({
      where: {
        productId: BigInt(productId),
        size,
      },
      include: {
        Ingredient: true,
      },
    });

    if (recipes.length === 0) {
      return;
    }

    // Kiểm tra đủ nguyên liệu trước khi trừ
    for (const item of recipes) {
      const required = item.amount * qty;
      if (item.Ingredient.stock < required) {
        throw new BadRequestException(
          `Nguyên liệu "${item.Ingredient.name}" không đủ (cần ${required}${item.unit}, còn ${item.Ingredient.stock}${item.unit})`,
        );
      }
    }

    // Trừ nguyên liệu trong transaction
    await this.prisma.$transaction(
      recipes.map((item) =>
        this.prisma.ingredient.update({
          where: { id: item.ingredientId },
          data: {
            stock: {
              decrement: item.amount * qty,
            },
          },
        }),
      ),
    );
  }
}
