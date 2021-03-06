import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsModule } from './../credentials/credentials.module';
import { ConfigModule } from '@nestjs/config';
import { S3Service } from './s3.service';

describe('S3Service', () => {
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CredentialsModule, ConfigModule],
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
