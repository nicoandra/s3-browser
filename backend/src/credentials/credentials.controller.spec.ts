import { Test, TestingModule } from '@nestjs/testing';
import { forwardRef } from '@nestjs/common';

import { CredentialsController } from './credentials.controller';
import { S3Module } from './../s3/s3.module';
import { CredentialsService } from './credentials.service';

describe('CredentialsController', () => {
  let controller: CredentialsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [forwardRef(() => S3Module)],
      controllers: [CredentialsController],
      providers: [CredentialsService],
    }).compile();

    controller = module.get<CredentialsController>(CredentialsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
