import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CredentialsModule } from './credentials/credentials.module';
import { S3Module } from './s3/s3.module';

@Module({
  imports: [CredentialsModule, S3Module],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
