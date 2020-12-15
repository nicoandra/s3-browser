import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsService } from './credentials.service';
import { S3Service } from './../s3/s3.service';
import { S3Module } from './../s3/s3.module';

describe('CredentialsService', () => {
  let service: CredentialsService;
  let s3service : S3Service;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [S3Module],
      providers: [CredentialsService, S3Service],
    }).compile();

    s3service = module.get<S3Service>(S3Service);
    service = module.get<CredentialsService>(CredentialsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
