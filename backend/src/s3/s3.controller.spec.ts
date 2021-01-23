import { Test, TestingModule } from '@nestjs/testing';
import { forwardRef } from '@nestjs/common';
import { S3Controller } from './s3.controller';
import { S3Service } from './s3.service';
import { CredentialsModule } from './../credentials/credentials.module';
import { GetBucketContentResponseDto } from './dto';
import { PassThrough, Stream } from 'stream';
import { createResponse } from 'node-mocks-http'

jest.mock('./s3.service');

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
      return <GetBucketContentResponseDto>new GetBucketContentResponseDto();
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


  it('should download a file', async () => {
    const mockedResponse = createResponse()
    const mockedStream = new PassThrough();

    const streamedContent = " ** THE CONTENT\n\nBEING STREAMED ** ";
    mockedStream.pause();

    jest.spyOn(service, 'getObjectHeaders').mockImplementation(async () => {
      return Promise.resolve({
        "ContentType": "file-type",
        "ContentLength": streamedContent.length,
      })
    });

    jest.spyOn(service, 'getObjectReadStream').mockImplementation(() => {
      return mockedStream;
    });

    mockedStream.on('data', (chunk) => {
      expect(chunk.toString()).toBe(streamedContent);
      expect(mockedResponse.getHeaders()).toEqual({ 'content-type': 'file-type', 'content-length': '35' })
    });
    
    const result = await controller.getObject(
      'bucketName',
      'objectName',
      mockedResponse
    );

    mockedStream.write(streamedContent)
  });


  it('should peek a file', async () => {
    const mockedStream = new PassThrough();
    const mockedResponse = createResponse({writableStream: mockedStream})
    
    const streamedContent = " ** THE CONTENT\n\nBEING STREAMED ** ";
    mockedStream.pause();

    jest.spyOn(service, 'getObjectHeaders').mockImplementation(async () => {
      return Promise.resolve({
        "ContentType": "file-type",
        "ContentLength": streamedContent.length,
      })
    });

    jest.spyOn(service, 'getObjectReadStream').mockImplementation(() => {
      return mockedStream;
    });

    mockedStream.on('data', (chunk) => {
      expect(chunk.toString()).toBe(streamedContent);
      expect(mockedResponse.getHeaders()).toEqual({ 'content-type': 'file-type', 'content-length': '35' })
    });
    
    const result = await controller.peekObject(
      'bucketName',
      'objectName',
      mockedResponse
    );

    mockedStream.write(streamedContent)
  });  
   
});
