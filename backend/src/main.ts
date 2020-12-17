import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/httpException.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalFilters(new HttpExceptionFilter());
  
  const options = new DocumentBuilder()
    .setTitle('S3 Browser')
    .setDescription('API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('doc', app, document);


  const port = process.env.BACKEND_PORT ? parseInt(process.env.BACKEND_PORT) : 3000
  await app.listen(port);
}

bootstrap();
