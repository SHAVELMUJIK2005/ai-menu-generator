import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { GlobalHttpExceptionFilter } from "./common/filters/http-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Глобальный префикс API
  app.setGlobalPrefix("api");

  // CORS для фронтенда и Telegram
  // FRONTEND_URL — Vercel URL фронтенда (задаётся через env)
  const frontendUrls = [
    "http://localhost:5173",
    "https://t.me",
    "https://greenmenuai.ru",
    "https://www.greenmenuai.ru",
    process.env.FRONTEND_URL,
  ].filter(Boolean) as string[];

  app.enableCors({
    origin: frontendUrls,
    credentials: true,
  });

  // Глобальный фильтр ошибок — унифицированный JSON формат
  app.useGlobalFilters(new GlobalHttpExceptionFilter());

  // Глобальная валидация DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Swagger UI на /api/docs
  const config = new DocumentBuilder()
    .setTitle("AI Menu Generator API")
    .setDescription("Telegram Mini App для генерации меню питания")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🚀 Backend: http://localhost:${process.env.PORT ?? 3000}/api`);
  console.log(`📚 Swagger: http://localhost:${process.env.PORT ?? 3000}/api/docs`);
}
bootstrap();
