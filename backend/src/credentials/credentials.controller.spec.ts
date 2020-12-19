import { Test, TestingModule } from '@nestjs/testing';
import { forwardRef } from '@nestjs/common';

import { CredentialsController } from './credentials.controller';
import { S3Module } from './../s3/s3.module';
import { CredentialsService } from './credentials.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('CredentialsController', () => {
  let controller: CredentialsController;
  let mockCredentialsService: CredentialsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [forwardRef(() => S3Module), ConfigModule],
      controllers: [CredentialsController],
      providers: [CredentialsService],
    })
      .overrideProvider(CredentialsService)
      .useValue(mockCredentialsService)
      .compile();

    controller = module.get<CredentialsController>(CredentialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
