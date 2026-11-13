import * as fs from 'fs';
import * as path from 'path';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

// Đảm bảo BigInt trong Prisma Model có thể serialize thành JSON string khi trả về API
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

/**
 * Tách các câu lệnh SQL từ file SQL đa dòng (loại bỏ BEGIN/COMMIT và comment).
 */
function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = '';
  let inString = false;
  let inLineComment = false;

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
      }
      continue;
    }

    if (!inString && char === '-' && nextChar === '-') {
      inLineComment = true;
      i++;
      continue;
    }

    if (char === "'") {
      if (inString && nextChar === "'") {
        current += "''";
        i++;
        continue;
      }
      inString = !inString;
      current += char;
      continue;
    }

    if (char === ';' && !inString) {
      const trimmed = current.trim();
      if (trimmed && trimmed.toUpperCase() !== 'BEGIN' && trimmed.toUpperCase() !== 'COMMIT') {
        statements.push(trimmed);
      }
      current = '';
      continue;
    }

    current += char;
  }

  const trimmed = current.trim();
  if (trimmed && trimmed.toUpperCase() !== 'BEGIN' && trimmed.toUpperCase() !== 'COMMIT') {
    statements.push(trimmed);
  }

  return statements;
}

/**
 * Đảm bảo dữ liệu mẫu đã được nạp vào cơ sở dữ liệu PostgreSQL.
 * Nếu chưa có dữ liệu (bảng User hoặc Product rỗng), nạp tự động từ brewlite_seed_data.sql.
 */
export async function ensureSeedData(prisma: PrismaService): Promise<void> {
  // Đảm bảo cấu trúc cột description trong bảng Product luôn tồn tại đồng bộ với schema.prisma
  await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "description" TEXT;');

  const productCount = await prisma.product.count();
  const userCount = await prisma.user.count();

  if (productCount > 0 && userCount > 0) {
    return;
  }

  const seedFilePath = path.join(__dirname, '..', 'prisma', 'database local', 'brewlite_seed_data.sql');
  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`Không tìm thấy file seed SQL tại: ${seedFilePath}`);
  }

  const sqlContent = fs.readFileSync(seedFilePath, 'utf-8');
  const statements = splitSqlStatements(sqlContent);

  await prisma.$transaction(
    async (tx) => {
      for (const stmt of statements) {
        await tx.$executeRawUnsafe(stmt);
      }
    },
    { timeout: 30000 },
  );
}

/**
 * Đặt lại trạng thái và nạp dữ liệu kiểm thử trong PostgreSQL:
 * - Truncate các bảng Order, Payment, LoyaltyTransaction với RESTART IDENTITY CASCADE
 * - Dọn sạch các tài khoản người dùng test tạo động trong quá trình chạy E2E
 * - Khôi phục điểm thưởng người dùng kiểm thử về mặc định (50 điểm cho customer@brewlite.com)
 * - Khôi phục định mức tồn kho nguyên vật liệu và version sản phẩm về trạng thái gốc
 * - Đảm bảo dữ liệu danh mục, sản phẩm, công thức luôn sẵn sàng
 */
export async function resetAndSeedDatabase(prisma: PrismaService): Promise<void> {
  // 1. Truncate các bảng liên quan đến Order & Payment và khởi tạo lại auto-increment ID
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE 
      "OrderItemTopping", 
      "OrderItem", 
      "Payment", 
      "LoyaltyTransaction", 
      "Order" 
    RESTART IDENTITY CASCADE;
  `);

  // 2. Xóa các tài khoản người dùng test tạo động trong quá trình chạy E2E
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['e2e.buyer@gmail.com', 'test.buyer@brewlite.com'],
      },
    },
  });

  // 3. Khôi phục điểm tích lũy của khách hàng mẫu
  await prisma.user.updateMany({
    where: { email: 'customer@brewlite.com' },
    data: { loyaltyPoints: 50 },
  });

  // 4. Khôi phục tồn kho nguyên liệu theo chuẩn seed data
  const initialStocks: Record<number, number> = {
    1: 5000,
    2: 5000,
    3: 10000,
    4: 10000,
    5: 8000,
    6: 8000,
    7: 3000,
    8: 2000,
    9: 2000,
    10: 4000,
    11: 500,
    12: 500,
    13: 500,
  };

  for (const [idStr, stock] of Object.entries(initialStocks)) {
    await prisma.ingredient.updateMany({
      where: { id: Number(idStr) },
      data: { stock },
    });
  }

  // 5. Khôi phục version sản phẩm về 0
  await prisma.product.updateMany({
    data: { version: 0 },
  });

  // 6. Đảm bảo dữ liệu mẫu tối thiểu
  await ensureSeedData(prisma);
}

// Alias tương thích ngược cho resetTestDatabase
export const resetTestDatabase = resetAndSeedDatabase;

export interface TestNestAppContext {
  app: INestApplication;
  prisma: PrismaService;
}

/**
 * Khởi tạo NestJS Application instance thực tế kết nối trực tiếp với PostgreSQL.
 * Sử dụng PrismaService thật để kiểm thử trực tiếp các câu lệnh truy vấn, Transaction và Optimistic Locking.
 */
export async function createTestNestApp(): Promise<TestNestAppContext> {
  // Đảm bảo cấu hình DATABASE_URL mặc định nếu môi trường chưa cung cấp
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = 'postgresql://postgres:123456@localhost:5432/brewlite?schema=public';
  }

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.init();
  const prisma = app.get(PrismaService);

  // Đảm bảo seed data đã có trong CSDL thật
  await ensureSeedData(prisma);

  // Dọn dẹp dữ liệu trước khi chạy test
  await resetTestDatabase(prisma);

  return { app, prisma };
}
