import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

describe('PaymentsController (Security & Guards)', () => {
  let controller: PaymentsController;

  const mockPaymentsService = {
    create: jest.fn(),
    verifyPayOSPayment: jest.fn(),
    createPayOSLink: jest.fn(),
    handlePayOSWebhook: jest.fn(),
    confirmPayOSWebhookUrl: jest.fn(),
    getPaymentStatus: jest.fn(),
    createMomoPayment: jest.fn(),
    handleMomoIPN: jest.fn(),
    findByOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: mockPaymentsService,
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
  });

  it('phải được định nghĩa', () => {
    expect(controller).toBeDefined();
  });

  it('các route của khách hàng phải được bảo vệ bởi JwtAuthGuard', () => {
    const createGuards = Reflect.getMetadata('__guards__', controller.create);
    expect(createGuards).toBeDefined();
    expect(createGuards).toEqual(expect.arrayContaining([JwtAuthGuard]));

    const payosLinkGuards = Reflect.getMetadata('__guards__', controller.createPayOSLink);
    expect(payosLinkGuards).toBeDefined();
    expect(payosLinkGuards).toEqual(expect.arrayContaining([JwtAuthGuard]));

    const statusGuards = Reflect.getMetadata('__guards__', controller.getStatus);
    expect(statusGuards).toBeDefined();
    expect(statusGuards).toEqual(expect.arrayContaining([JwtAuthGuard]));

    const momoPaymentGuards = Reflect.getMetadata('__guards__', controller.createMomoPayment);
    expect(momoPaymentGuards).toBeDefined();
    expect(momoPaymentGuards).toEqual(expect.arrayContaining([JwtAuthGuard]));

    const findByOrderGuards = Reflect.getMetadata('__guards__', controller.findByOrder);
    expect(findByOrderGuards).toBeDefined();
    expect(findByOrderGuards).toEqual(expect.arrayContaining([JwtAuthGuard]));
  });

  it('các route webhook/IPN từ cổng thanh toán phải là public (không dùng JwtAuthGuard)', () => {
    const webhookGuards = Reflect.getMetadata('__guards__', controller.handlePayOSWebhook);
    expect(webhookGuards).toBeUndefined();

    const ipnGuards = Reflect.getMetadata('__guards__', controller.handleMomoIPN);
    expect(ipnGuards).toBeUndefined();
  });
});
