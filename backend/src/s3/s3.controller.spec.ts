import { Test, TestingModule } from '@nestjs/testing';
import { forwardRef } from '@nestjs/common';
import { S3Controller } from './s3.controller';
import { S3Service } from './s3.service';
import { CredentialsModule } from './../credentials/credentials.module';
import { GetBucketContentResponseDto } from './dto';

describe('S3Controller', () => {
  let controller: S3Controller;
  let service: S3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [forwardRef(() => CredentialsModule)],

      controllers: [S3Controller],
      providers: [S3Service],
    }).compile();

    service = module.get<S3Service>(S3Service);
    controller = module.get<S3Controller>(S3Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should list buckets', async () => {
    jest.spyOn(service, 'listBuckets').mockImplementation(async () => {
      return [];
    });
    const result = await controller.get();
    expect(result).toEqual([]);

    jest
      .spyOn(service, 'listBuckets')
      .mockImplementation(async () => [
        { name: 'OneBucket', createdAt: new Date(2020, 1, 2, 3, 5, 6) },
      ]);
    expect(await controller.get()).toEqual([
      { name: 'OneBucket', createdAt: new Date(2020, 1, 2, 3, 5, 6) },
    ]);
  });

  it('should list bucket contents', async () => {
    jest.spyOn(service, 'listBucketContents').mockImplementation(async () => {
      return <AWS.S3.ListObjectsV2Output>{ Contents: [], CommonPrefixes: [] };
    });
    const result = await controller.listContent(
      'bucketName',
      undefined,
      undefined,
    );
    expect(result).toEqual(<GetBucketContentResponseDto>{
      currentPrefixes: [],
      prefixes: [],
      contents: [],
      truncated: false,
      continuationToken: '',
    });
  });
});
