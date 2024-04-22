import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MongoDatabase } from '@quo-pro/database-connect';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: "Content-Type, Accept, access-token, role, Authorization",
  });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ stopAtFirstError: true }));
  const options = new DocumentBuilder()
    .setTitle('Quo-Pro API Documentation')
    .setDescription('User & Socket APIs')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local environment')
    .addServer(`https://${process.env.VERCEL_URL}/`, 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/v1/api-docs', app, document);

  await app.listen(process.env.PORT);

  console.log('Connecting to MongoDB...');
  const mongoConnection = new MongoDatabase(process.env.MONGODB_URI);
  await mongoConnection.connect().then(() => console.log('Connected to MongoDB!')).catch((err) => console.error('Failed to connect to MongoDB:', err));
}
bootstrap();
