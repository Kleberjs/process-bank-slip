import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalExeptionFilter } from './infra/filters/global-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT ?? 3000;

  // swagger configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('ms-api-file')
    .setDescription('Upload csv file to generate bank slip')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`api/docs`, app, document);
  // end swagger configuration

  app.useGlobalFilters(new GlobalExeptionFilter());
  await app.listen(port);
}

bootstrap().catch((error) =>
  console.log(`Error boostrap ${JSON.stringify(error)}`),
);
