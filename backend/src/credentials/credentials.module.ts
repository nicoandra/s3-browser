import { forwardRef, Module } from '@nestjs/common';
import { S3Module } from './../s3/s3.module';
import { CredentialsController } from './credentials.controller';
import { CredentialsService } from './credentials.service';

@Module({
  imports: [forwardRef(() => S3Module)],
  controllers: [CredentialsController],
  providers: [CredentialsService],
  exports: [CredentialsService],
})
export class CredentialsModule {}
