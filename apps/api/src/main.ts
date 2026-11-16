import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,            // tự ép kiểu theo DTO
    }),
  );
  const rawCorsOrigins = process.env.CORS_ORIGIN?.trim();
  const allowedOrigins = rawCorsOrigins
    ? rawCorsOrigins
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];

  const defaultDevOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
  const origins =
    allowedOrigins.length > 0
      ? allowedOrigins
      : process.env.NODE_ENV === 'production'
        ? false
        : defaultDevOrigins;

  app.enableCors({
    origin: origins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`Backend server is running on http://0.0.0.0:${port}`);
}
void bootstrap();
