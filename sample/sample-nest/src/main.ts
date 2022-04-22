import { NestFactory } from '@nestjs/core';
import { SingersModule } from './singers/singers.module';

async function bootstrap() {
  const app = await NestFactory.create(SingersModule);
  await app.listen(3000);
}
bootstrap();
