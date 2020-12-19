import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { CredentialsModule } from './credentials/credentials.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [CredentialsModule, S3Module, ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
