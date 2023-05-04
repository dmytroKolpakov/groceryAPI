import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

// token
//Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2NDUyNzE5M2Y0Njk5OGU0MDZmNzI5ODMiLCJyb2xlcyI6WyJ1c2VyIl0sImlhdCI6MTY4MzEyNDY0MCwiZXhwIjoxNjgzOTg4NjQwfQ.xVk9szdZkwghUpvcm_KzH1eLixXjkGkJ-qCzgiUljS8

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
  .addSecurity('bearer', {
    type: 'http',
    scheme: 'bearer',
  })
  .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  await app.listen(3000);
}
bootstrap();
