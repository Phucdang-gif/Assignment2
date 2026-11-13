import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { order_status, payment_method, payment_status, product_size } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

export interface InMemoryCategory {
  id: number;
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryUser {
  id: bigint;
  fullName: string | null;
  email: string;
  phone: string | null;
  passwordHash: string;
  loyaltyPoints: number;
  role: 'customer' | 'barista' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryIngredient {
  id: number;
  name: string;
  unit: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryRecipeItem {
  id: number;
  productId: bigint;
  size: product_size;
  ingredientId: number;
  amount: number;
  unit: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryProduct {
  id: bigint;
  categoryId: number;
  name: string;
  price: number;
  imageUrl: string | null;
  description: string | null;
  version: number;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryTopping {
  id: number;
  name: string;
  price: number;
  isAvailable: boolean;
  createdAt: Date;
}

export interface InMemoryPromotion {
  id: bigint;
  code: string;
  description: string | null;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'MEMBERSHIP_TIER';
  discountValue: number;
  minOrderValue: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InMemoryOrderItemTopping {
  orderItemId: bigint;
  toppingId: number;
  priceAtTime: number;
}

export interface InMemoryOrderItem {
  id: bigint;
  orderId: bigint;
  productId: bigint;
  size: product_size;
  qty: number;
  unitPrice: number;
  lineTotal: number;
  OrderItemTopping: InMemoryOrderItemTopping[];
}

export interface InMemoryPayment {
  id: bigint;
  orderId: bigint;
  idempotencyKey: string;
  amount: number;
  method: payment_method;
  status: payment_status;
  transactionRef: string | null;
  createdAt: Date;
}

export interface InMemoryOrder {
  id: bigint;
  userId: bigint;
  promotionId: bigint | null;
  status: order_status;
  subtotal: number;
  discountAmount: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
  OrderItem: InMemoryOrderItem[];
}

export interface InMemoryLoyaltyTransaction {
  id: bigint;
  userId: bigint;
  orderId: bigint | null;
  points: number;
  type: 'EARN' | 'REDEEM' | 'ADJUST';
  balanceAfter: number;
  reason: string | null;
  createdAt: Date;
}

export class StatefulPrismaTestHarness {
  categories: InMemoryCategory[] = [];
  users: InMemoryUser[] = [];
  ingredients: InMemoryIngredient[] = [];
  recipes: InMemoryRecipeItem[] = [];
  products: InMemoryProduct[] = [];
  toppings: InMemoryTopping[] = [];
  promotions: InMemoryPromotion[] = [];
  orders: InMemoryOrder[] = [];
  payments: InMemoryPayment[] = [];
  loyaltyTransactions: InMemoryLoyaltyTransaction[] = [];

  private nextUserId = 10n;
  private nextOrderId = 1n;
  private nextOrderItemId = 1n;
  private nextPaymentId = 1n;
  private nextLoyaltyId = 1n;
  public simulateVersionConflictOnce = false;

  async seedDefaultData(): Promise<void> {
    const now = new Date();
    const customerHash = await bcrypt.hash('customer123', 10);
    const baristaHash = await bcrypt.hash('barista123', 10);

    this.categories = [
      { id: 1, name: 'Cà phê', createdAt: now, updatedAt: now },
      { id: 2, name: 'Trà trái cây', createdAt: now, updatedAt: now },
      { id: 3, name: 'Trà sữa', createdAt: now, updatedAt: now },
    ];

    this.users = [
      {
        id: 1n,
        fullName: 'Nguyễn Văn Barista',
        email: 'barista@brewlite.com',
        phone: '0901234567',
        passwordHash: baristaHash,
        loyaltyPoints: 100,
        role: 'barista',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2n,
        fullName: 'Trần Thị Khách Hàng',
        email: 'customer@brewlite.com',
        phone: '0912345678',
        passwordHash: customerHash,
        loyaltyPoints: 50, // Hạng Vàng (-10%)
        role: 'customer',
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.ingredients = [
      { id: 1, name: 'Cà phê Robusta Đắk Lắk', unit: 'g', stock: 200, createdAt: now, updatedAt: now },
      { id: 3, name: 'Sữa đặc Ngôi Sao Phương Nam', unit: 'ml', stock: 350, createdAt: now, updatedAt: now },
      { id: 11, name: 'Ly giấy Size S', unit: 'cai', stock: 10, createdAt: now, updatedAt: now },
      { id: 12, name: 'Ly giấy Size M', unit: 'cai', stock: 10, createdAt: now, updatedAt: now },
      { id: 13, name: 'Ly giấy Size L', unit: 'cai', stock: 10, createdAt: now, updatedAt: now },
    ];

    this.products = [
      {
        id: 1n,
        categoryId: 1,
        name: 'Cà phê sữa đá',
        price: 35000,
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600',
        description: 'Cà phê Robusta Đắk Lắk truyền thống pha phin đậm đà',
        version: 0,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 2n,
        categoryId: 1,
        name: 'Americano',
        price: 40000,
        imageUrl: 'https://images.unsplash.com/photo-1551030173-122aabc4489c?w=600',
        description: 'Hai shot Espresso nguyên chất',
        version: 0,
        status: 'active',
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.recipes = [
      { id: 1, productId: 1n, size: 'S', ingredientId: 1, amount: 20, unit: 'g', createdAt: now, updatedAt: now },
      { id: 2, productId: 1n, size: 'S', ingredientId: 3, amount: 25, unit: 'ml', createdAt: now, updatedAt: now },
      { id: 3, productId: 1n, size: 'S', ingredientId: 11, amount: 1, unit: 'cai', createdAt: now, updatedAt: now },
      { id: 4, productId: 1n, size: 'M', ingredientId: 1, amount: 25, unit: 'g', createdAt: now, updatedAt: now },
      { id: 5, productId: 1n, size: 'M', ingredientId: 3, amount: 35, unit: 'ml', createdAt: now, updatedAt: now },
      { id: 6, productId: 1n, size: 'M', ingredientId: 12, amount: 1, unit: 'cai', createdAt: now, updatedAt: now },
      { id: 7, productId: 1n, size: 'L', ingredientId: 1, amount: 35, unit: 'g', createdAt: now, updatedAt: now },
      { id: 8, productId: 1n, size: 'L', ingredientId: 3, amount: 50, unit: 'ml', createdAt: now, updatedAt: now },
      { id: 9, productId: 1n, size: 'L', ingredientId: 13, amount: 1, unit: 'cai', createdAt: now, updatedAt: now },
      { id: 10, productId: 2n, size: 'M', ingredientId: 1, amount: 20, unit: 'g', createdAt: now, updatedAt: now },
      { id: 11, productId: 2n, size: 'M', ingredientId: 12, amount: 1, unit: 'cai', createdAt: now, updatedAt: now },
    ];

    this.toppings = [
      { id: 1, name: 'Trân châu đen hoàng gia', price: 5000, isAvailable: true, createdAt: now },
      { id: 2, name: 'Kem cheese (Macchiato)', price: 10000, isAvailable: true, createdAt: now },
      { id: 3, name: 'Thạch dừa non giòn', price: 5000, isAvailable: true, createdAt: now },
    ];

    this.promotions = [
      {
        id: 1n,
        code: 'WELCOME10',
        description: 'Giảm 10.000đ cho đơn từ 50.000đ',
        discountType: 'FIXED_AMOUNT',
        discountValue: 10000,
        minOrderValue: 50000,
        startDate: new Date(now.getTime() - 86400000),
        endDate: new Date(now.getTime() + 86400000 * 30),
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    ];

    this.orders = [];
    this.payments = [];
    this.loyaltyTransactions = [];
    this.nextUserId = 10n;
    this.nextOrderId = 1n;
    this.nextOrderItemId = 1n;
    this.nextPaymentId = 1n;
    this.nextLoyaltyId = 1n;
    this.simulateVersionConflictOnce = false;
  }

  private enrichProduct(p: InMemoryProduct) {
    const category = this.categories.find((c) => c.id === p.categoryId) ?? null;
    const ProductRecipeItem = this.recipes
      .filter((r) => r.productId === p.id)
      .map((r) => ({
        ...r,
        Ingredient: this.ingredients.find((i) => i.id === r.ingredientId)!,
      }));
    return {
      ...p,
      category,
      ProductRecipeItem,
    };
  }

  private enrichOrder(o: InMemoryOrder) {
    const User = this.users.find((u) => u.id === o.userId);
    const Payment = this.payments.filter((p) => p.orderId === o.id);
    const OrderItem = o.OrderItem.map((item) => ({
      ...item,
      Product: this.products.find((p) => p.id === item.productId) ?? null,
      OrderItemTopping: item.OrderItemTopping.map((oit) => ({
        ...oit,
        Topping: this.toppings.find((t) => t.id === oit.toppingId) ?? null,
      })),
    }));
    return {
      ...o,
      User: User ? { id: User.id, email: User.email } : undefined,
      Payment,
      OrderItem,
    };
  }

  createClient(): Record<string, unknown> {
    const client: Record<string, unknown> = {
      $connect: async () => {},
      $disconnect: async () => {},
      $queryRaw: async () => [
        {
          enum_range: [
            'PENDING',
            'PAID',
            'PREPARING',
            'READY',
            'COMPLETED',
            'PAYMENT_FAILED',
            'CANCELLED',
          ],
        },
      ],
      $transaction: async (arg: unknown) => {
        if (Array.isArray(arg)) {
          return Promise.all(arg);
        }
        if (typeof arg === 'function') {
          // Snapshot state for atomic rollback on error
          const snapIngredients = this.ingredients.map((i) => ({ ...i }));
          const snapProducts = this.products.map((p) => ({ ...p }));
          const snapOrders = this.orders.map((o) => ({
            ...o,
            OrderItem: o.OrderItem.map((oi) => ({
              ...oi,
              OrderItemTopping: oi.OrderItemTopping.map((t) => ({ ...t })),
            })),
          }));
          const snapPayments = this.payments.map((p) => ({ ...p }));
          try {
            return await (arg as (tx: Record<string, unknown>) => Promise<unknown>)(client);
          } catch (err) {
            this.ingredients = snapIngredients;
            this.products = snapProducts;
            this.orders = snapOrders;
            this.payments = snapPayments;
            throw err;
          }
        }
        return arg;
      },

      category: {
        findMany: async () => [...this.categories].sort((a, b) => a.name.localeCompare(b.name)),
        findUnique: async ({ where }: { where: { id: number } }) =>
          this.categories.find((c) => c.id === Number(where.id)) ?? null,
      },

      product: {
        findMany: async ({ where }: { where?: { status?: string } } = {}) => {
          const list = where?.status
            ? this.products.filter((p) => p.status === where.status)
            : this.products;
          return list.map((p) => this.enrichProduct(p));
        },
        findUnique: async ({ where }: { where: { id: number | bigint } }) => {
          const id = BigInt(where.id);
          const found = this.products.find((p) => p.id === id);
          return found ? this.enrichProduct(found) : null;
        },
        updateMany: async ({
          where,
          data,
        }: {
          where: { id: number | bigint; version?: number };
          data: { version?: { increment: number } };
        }) => {
          if (this.simulateVersionConflictOnce) {
            this.simulateVersionConflictOnce = false;
            return { count: 0 };
          }
          const id = BigInt(where.id);
          const prod = this.products.find(
            (p) => p.id === id && (where.version === undefined || p.version === where.version),
          );
          if (!prod) return { count: 0 };
          if (data.version?.increment) {
            prod.version += data.version.increment;
          }
          prod.updatedAt = new Date();
          return { count: 1 };
        },
        update: async ({
          where,
          data,
        }: {
          where: { id: number | bigint };
          data: { version?: { increment: number }; status?: 'active' | 'inactive' };
        }) => {
          const id = BigInt(where.id);
          const prod = this.products.find((p) => p.id === id);
          if (!prod) throw new Error(`Product ${String(id)} not found`);
          if (data.version?.increment) prod.version += data.version.increment;
          if (data.status) prod.status = data.status;
          prod.updatedAt = new Date();
          return this.enrichProduct(prod);
        },
      },

      productRecipeItem: {
        findMany: async ({
          where,
        }: {
          where: { productId: number | bigint; size?: product_size };
        }) => {
          const pid = BigInt(where.productId);
          return this.recipes
            .filter(
              (r) =>
                r.productId === pid && (!where.size || r.size === where.size),
            )
            .map((r) => ({
              ...r,
              Ingredient: this.ingredients.find((i) => i.id === r.ingredientId)!,
            }));
        },
      },

      ingredient: {
        update: async ({
          where,
          data,
        }: {
          where: { id: number };
          data: { stock: { decrement?: number; increment?: number } };
        }) => {
          const ing = this.ingredients.find((i) => i.id === Number(where.id));
          if (!ing) throw new Error(`Ingredient ${where.id} not found`);
          if (data.stock.decrement) ing.stock -= data.stock.decrement;
          if (data.stock.increment) ing.stock += data.stock.increment;
          ing.updatedAt = new Date();
          return { ...ing };
        },
      },

      topping: {
        findMany: async ({
          where,
        }: {
          where?: { isAvailable?: boolean; name?: { in: string[] } };
        } = {}) => {
          return this.toppings.filter((t) => {
            if (where?.isAvailable !== undefined && t.isAvailable !== where.isAvailable) {
              return false;
            }
            if (where?.name?.in && !where.name.in.includes(t.name)) {
              return false;
            }
            return true;
          });
        },
        findUnique: async ({ where }: { where: { id: number } }) =>
          this.toppings.find((t) => t.id === Number(where.id)) ?? null,
      },

      promotion: {
        findUnique: async ({ where }: { where: { code: string } }) =>
          this.promotions.find((p) => p.code === where.code) ?? null,
      },

      user: {
        findUnique: async ({
          where,
        }: {
          where: { id?: number | bigint; email?: string };
        }) => {
          const found = this.users.find((u) => {
            if (where.id !== undefined) return u.id === BigInt(where.id);
            if (where.email !== undefined) return u.email === where.email;
            return false;
          });
          return found ? { ...found } : null;
        },
        create: async ({
          data,
        }: {
          data: {
            email: string;
            fullName?: string;
            phone?: string;
            passwordHash: string;
            role?: 'customer' | 'barista' | 'admin';
          };
        }) => {
          const now = new Date();
          const newUser: InMemoryUser = {
            id: this.nextUserId++,
            email: data.email,
            fullName: data.fullName ?? null,
            phone: data.phone ?? null,
            passwordHash: data.passwordHash,
            loyaltyPoints: 0,
            role: data.role ?? 'customer',
            createdAt: now,
            updatedAt: now,
          };
          this.users.push(newUser);
          return { ...newUser };
        },
        update: async ({
          where,
          data,
        }: {
          where: { id: number | bigint };
          data: { loyaltyPoints?: { increment: number } };
        }) => {
          const uid = BigInt(where.id);
          const user = this.users.find((u) => u.id === uid);
          if (!user) throw new Error(`User ${String(uid)} not found`);
          if (data.loyaltyPoints?.increment) {
            user.loyaltyPoints += data.loyaltyPoints.increment;
          }
          user.updatedAt = new Date();
          return { ...user };
        },
        findMany: async () => this.users.map((u) => ({ ...u })),
        count: async () => this.users.length,
      },

      order: {
        findFirst: async ({
          where,
        }: {
          where: { userId?: bigint; status?: order_status; createdAt?: { gte?: Date } };
        }) => {
          // Disable 4s deduplication window in automated tests so sequential test orders create distinct orders
          if (where.createdAt?.gte) return null;
          const found = this.orders.find(
            (o) =>
              (!where.userId || o.userId === BigInt(where.userId)) &&
              (!where.status || o.status === where.status),
          );
          return found ? this.enrichOrder(found) : null;
        },
        findMany: async ({
          where,
        }: {
          where?: {
            userId?: bigint;
            status?: order_status | { in: order_status[] };
            createdAt?: { lt?: Date };
          };
        } = {}) => {
          if (where?.createdAt?.lt) {
            return [];
          }
          const filtered = this.orders.filter((o) => {
            if (where?.userId !== undefined && o.userId !== BigInt(where.userId)) {
              return false;
            }
            if (where?.status) {
              if (typeof where.status === 'string') {
                if (o.status !== where.status) return false;
              } else if (Array.isArray(where.status.in)) {
                if (!where.status.in.includes(o.status)) return false;
              }
            }
            return true;
          });
          return filtered.map((o) => this.enrichOrder(o));
        },
        findUnique: async ({ where }: { where: { id: number | bigint } }) => {
          const oid = BigInt(where.id);
          const found = this.orders.find((o) => o.id === oid);
          return found ? this.enrichOrder(found) : null;
        },
        create: async ({
          data,
        }: {
          data: {
            userId: bigint;
            status: order_status;
            subtotal: number;
            discountAmount: number;
            total: number;
            promotionId?: bigint;
            OrderItem: {
              create: Array<{
                size: product_size;
                qty: number;
                unitPrice: number;
                lineTotal: number;
                Product: { connect: { id: bigint } };
                OrderItemTopping?: {
                  create: Array<{ toppingId: number; priceAtTime: number }>;
                };
              }>;
            };
          };
        }) => {
          const now = new Date();
          const orderId = this.nextOrderId++;
          const items: InMemoryOrderItem[] = data.OrderItem.create.map((raw) => {
            const itemId = this.nextOrderItemId++;
            const toppings: InMemoryOrderItemTopping[] = (
              raw.OrderItemTopping?.create ?? []
            ).map((t) => ({
              orderItemId: itemId,
              toppingId: t.toppingId,
              priceAtTime: t.priceAtTime,
            }));
            return {
              id: itemId,
              orderId,
              productId: BigInt(raw.Product.connect.id),
              size: raw.size,
              qty: raw.qty,
              unitPrice: Number(raw.unitPrice),
              lineTotal: Number(raw.lineTotal),
              OrderItemTopping: toppings,
            };
          });
          const order: InMemoryOrder = {
            id: orderId,
            userId: BigInt(data.userId),
            promotionId: data.promotionId ?? null,
            status: data.status,
            subtotal: Number(data.subtotal),
            discountAmount: Number(data.discountAmount),
            total: Number(data.total),
            createdAt: now,
            updatedAt: now,
            OrderItem: items,
          };
          this.orders.push(order);
          return this.enrichOrder(order);
        },
        update: async ({
          where,
          data,
        }: {
          where: { id: number | bigint };
          data: { status: order_status };
        }) => {
          const oid = BigInt(where.id);
          const order = this.orders.find((o) => o.id === oid);
          if (!order) throw new Error(`Order ${String(oid)} not found`);
          order.status = data.status;
          order.updatedAt = new Date();
          return this.enrichOrder(order);
        },
      },

      orderItemTopping: {},

      payment: {
        findUnique: async ({ where }: { where: { idempotencyKey: string } }) =>
          this.payments.find((p) => p.idempotencyKey === where.idempotencyKey) ?? null,
        findFirst: async ({ where }: { where: { orderId: bigint } }) =>
          this.payments.find((p) => p.orderId === BigInt(where.orderId)) ?? null,
        findMany: async ({ where }: { where: { orderId: bigint } }) =>
          this.payments.filter((p) => p.orderId === BigInt(where.orderId)),
        create: async ({
          data,
        }: {
          data: {
            orderId: bigint;
            amount: number;
            method: payment_method;
            status: payment_status;
            transactionRef: string | null;
            idempotencyKey: string;
          };
        }) => {
          const payment: InMemoryPayment = {
            id: this.nextPaymentId++,
            orderId: BigInt(data.orderId),
            amount: Number(data.amount),
            method: data.method,
            status: data.status,
            transactionRef: data.transactionRef,
            idempotencyKey: data.idempotencyKey,
            createdAt: new Date(),
          };
          this.payments.push(payment);
          return { ...payment };
        },
      },

      loyaltyTransaction: {
        create: async ({
          data,
        }: {
          data: {
            userId: bigint;
            orderId?: bigint;
            points: number;
            type: 'EARN' | 'REDEEM' | 'ADJUST';
            balanceAfter: number;
            reason?: string;
          };
        }) => {
          const record: InMemoryLoyaltyTransaction = {
            id: this.nextLoyaltyId++,
            userId: BigInt(data.userId),
            orderId: data.orderId ? BigInt(data.orderId) : null,
            points: data.points,
            type: data.type,
            balanceAfter: data.balanceAfter,
            reason: data.reason ?? null,
            createdAt: new Date(),
          };
          this.loyaltyTransactions.push(record);
          return { ...record };
        },
      },
    };

    return client;
  }
}

export async function createTestNestApp(): Promise<{
  app: INestApplication;
  db: StatefulPrismaTestHarness;
}> {
  (BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function (
    this: bigint,
  ) {
    return this.toString();
  };

  const db = new StatefulPrismaTestHarness();
  await db.seedDefaultData();

  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider(PrismaService)
    .useValue(db.createClient())
    .compile();

  const app = moduleFixture.createNestApplication();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  await app.init();

  return { app, db };
}
