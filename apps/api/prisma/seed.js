const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

function splitSqlStatements(sql) {
  const statements = [];
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

async function main() {
  console.log('=== BẮT ĐẦU SEED DỮ LIỆU TỪ FILE SQL CHO BREWLITE ===');

  const forceSeed = process.env.RUN_SEED === 'true' || process.env.FORCE_SEED === 'true';

  // Đảm bảo cấu trúc cột description trong bảng Product luôn tồn tại đồng bộ với schema.prisma
  await prisma.$executeRawUnsafe('ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "description" TEXT;');

  const existingProducts = await prisma.product.count();
  const existingUsers = await prisma.user.count();

  if (!forceSeed && existingProducts > 0 && existingUsers > 0) {
    console.log(`ℹ️ Database đã có dữ liệu (${existingProducts} sản phẩm, ${existingUsers} người dùng). Bỏ qua seed để tránh ghi đè dữ liệu khi container khởi động lại.`);
    return;
  }

  const seedFilePath = path.join(__dirname, 'database local', 'brewlite_seed_data.sql');

  if (!fs.existsSync(seedFilePath)) {
    throw new Error(`Không tìm thấy file seed SQL tại: ${seedFilePath}`);
  }

  console.log(`[1/3] Đang đọc file SQL: ${seedFilePath}`);
  const sqlContent = fs.readFileSync(seedFilePath, 'utf-8');
  const statements = splitSqlStatements(sqlContent);

  console.log(`[2/3] Đã phân tích thành công ${statements.length} câu lệnh SQL.`);
  console.log('[3/3] Đang thực thi các câu lệnh bên trong Transaction...');

  await prisma.$transaction(
    async (tx) => {
      for (let i = 0; i < statements.length; i++) {
        const stmt = statements[i];
        try {
          await tx.$executeRawUnsafe(stmt);
        } catch (err) {
          console.error(`❌ Lỗi tại câu lệnh thứ ${i + 1}:`, stmt.slice(0, 120));
          throw err;
        }
      }
    },
    {
      timeout: 30000, // Cho phép tối đa 30s để hoàn tất seed
    },
  );

  console.log('✅ Hoàn tất nạp dữ liệu mẫu từ brewlite_seed_data.sql thành công!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi thực hiện seed dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
