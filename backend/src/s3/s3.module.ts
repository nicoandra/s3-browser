import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';
import { CredentialsModule } from './../credentials/credentials.module';

@Module({
  imports: [forwardRef(() => CredentialsModule), ConfigModule],
  providers: [S3Service],
  controllers: [S3Controller],
  exports: [S3Service],
})
export class S3Module {}
