import { Test, TestingModule } from '@nestjs/testing';
import { CredentialsService } from './credentials.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './../s3/s3.service';
import { S3Module } from './../s3/s3.module';

const mockConfigService = {
  get(key: String) : String {
    if (key === 'AWS_REGION') return "the-region"
    if (key === 'AWS_ACCESS_KEY_ID') return "the-access-key-id"
    if (key === 'AWS_SECRET_ACCESS_KEY') return "the-secret-access-key"
    return ''
  }
}

describe('CredentialsService', () => {
  let service: CredentialsService;
  let s3service: S3Service;
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [S3Module, ConfigModule],
      providers: [CredentialsService, S3Service],
    }).overrideProvider(ConfigService).useValue(mockConfigService).compile();

    s3service = module.get<S3Service>(S3Service);
    service = module.get<CredentialsService>(CredentialsService);
    configService = module.get<ConfigService>(ConfigService)
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(s3service).toBeDefined();
  });

  it('get credentials', () => {
    const result = service.get()
    expect(result).toEqual({
      accessKeyId: "the-access-key-id",
      region: "the-region",
      secretAccessKey: "the-secret-access-key",
    })
  });

});
