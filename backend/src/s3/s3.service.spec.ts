import { Test, TestingModule } from '@nestjs/testing';
import MockDate from 'mockdate'
import { CredentialsModule } from './../credentials/credentials.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import * as AWS from 'aws-sdk';
import { GetObjectOutput, ListBucketsOutput } from 'aws-sdk/clients/s3';
import { dtoFactory } from './../common/dto'
import { BucketElementDto, GetAWSS3ObjectDto, GetBucketContentRequestDto, GetBucketContentResponseDto } from './dto';
import { UnauthorizedException } from '@nestjs/common';
import { assert } from 'console';
import { Readable } from 'stream'

jest.mock('aws-sdk');

describe('S3Service', () => {
  let service: S3Service;
  let refModule: TestingModule

  beforeEach(async () => {
    MockDate.reset()
    refModule = await Test.createTestingModule({
      imports: [CredentialsModule, ConfigModule],
      providers: [S3Service, ConfigService],
    }).compile();


    service = refModule.get<S3Service>(S3Service);

  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('should list buckets', () => {
    it('should list buckets when whitelist was set', async () => {
      MockDate.set('2020-01-02');
      service.setWhitelistedBuckets("whitelisted-bucket-1, whitelisted-bucket-2 ,,, whitelisted-bucket-3    ")
      const expected = [
        {createdAt: new Date("2020-01-02T00:00:00.000Z"), name: "whitelisted-bucket-1"}, 
        {createdAt: new Date("2020-01-02T00:00:00.000Z"), name: "whitelisted-bucket-2"}, 
        {createdAt: new Date("2020-01-02T00:00:00.000Z"), name: "whitelisted-bucket-3"}
      ]
      expect(await service.listBuckets()).toEqual(expected)
    })

    it('should list buckets when whitelist was not set', async () => {
      service.setWhitelistedBuckets("")
      const expected = [
        {createdAt: new Date("2020-01-02T00:00:00.000Z"), name: "online-bucket-1"}, 
        {createdAt: new Date("2020-01-02T00:00:00.000Z"), name: "online-bucket-2"},
        {createdAt: new Date("2020-01-02T00:00:00.000Z"), name: "online-bucket-3"}
      ]      
      expect(await service.listBuckets()).toEqual(expected)
    })


    it('should list buckets when whitelist was not set', async () => {
      service.setWhitelistedBuckets("")
      const mockedClient = <AWS.S3>{
        listBuckets: function (callback) {
          const result : ListBucketsOutput = {
            Buckets: [
              {CreationDate: new Date("2020-01-02T00:00:00.000Z"), Name: "from-test-bucket-1"}, 
              {CreationDate: new Date("2020-01-02T00:00:00.000Z"), Name: "from-test-bucket-2"}, 
              {CreationDate: new Date("2020-01-02T00:00:00.000Z"), Name: "from-test-bucket-3"}
            ]
          }
          return callback(null, result)
        }
      }
      service.setClient(mockedClient)
      const expected = [
        {createdAt: new Date("2020-01-02T00:00:00.000Z"), name: "from-test-bucket-1"}, 
        {createdAt: new Date("2020-01-02T00:00:00.000Z"), name: "from-test-bucket-2"},
        {createdAt: new Date("2020-01-02T00:00:00.000Z"), name: "from-test-bucket-3"}
      ]
      
      expect(await service.listBuckets()).toEqual(expected)
    })    
  });

  describe('should list bucket contents', () => {
    describe('when whitelist is set', () => {
      it('should list content for whitelisted buckets', async () => {
        MockDate.set('2020-01-02');
        service.setWhitelistedBuckets("one-bucket,another-bucket")
        const spy = jest.spyOn(AWS.S3.prototype, 'listObjectsV2');

        const payload = dtoFactory({bucket: "one-bucket"}, GetBucketContentRequestDto)
        const expected = {
          contents: [
            {eTag: undefined, friendlyName: "key-1", key: "key-1", lastUpdate: new Date("2020-01-02T00:00:00.000Z"), size: 1},
            {eTag: undefined, friendlyName: "key-2", key: "key-2", lastUpdate: new Date("2020-01-02T00:00:00.000Z"), size: 2},
            {eTag: undefined, friendlyName: "key-3", key: "key-3", lastUpdate: new Date("2020-01-02T00:00:00.000Z"), size: 3},
          ], 
          continuationToken: "", 
          currentPrefixes: [], 
          prefixes: ["prefix-one", "prefix-two"], truncated: true}

        const received = await service.listBucketContents(payload)
        expect(received).toEqual(expected)
        expect(spy).toHaveBeenCalledTimes(1)
        spy.mockClear()
      })

      it('should not list contents for not whitelisted buckets when whitelist is set', async () => {
        MockDate.set('2020-01-02');
        const spy = jest.spyOn(AWS.S3.prototype, 'listObjectsV2');
        service.setWhitelistedBuckets("one-bucket,another-bucket")
        const payload = dtoFactory({bucket: "not-allowed-bucket"}, GetBucketContentRequestDto)
        await expect(service.listBucketContents(payload)).rejects.toThrow(UnauthorizedException)
        expect(spy).toHaveBeenCalledTimes(0)
        spy.mockClear()
      })
    })

    describe('when whitelist is not set', () =>{
      it('should list contents', async () => {
        MockDate.set('2020-01-02');
        service.setWhitelistedBuckets("one-bucket,another-bucket")
        const spy = jest.spyOn(AWS.S3.prototype, 'listObjectsV2');

        const payload = dtoFactory({bucket: "one-bucket"}, GetBucketContentRequestDto)
        const expected = {
          contents: [
            {eTag: undefined, friendlyName: "key-1", key: "key-1", lastUpdate: new Date("2020-01-02T00:00:00.000Z"), size: 1},
            {eTag: undefined, friendlyName: "key-2", key: "key-2", lastUpdate: new Date("2020-01-02T00:00:00.000Z"), size: 2},
            {eTag: undefined, friendlyName: "key-3", key: "key-3", lastUpdate: new Date("2020-01-02T00:00:00.000Z"), size: 3},
          ], 
          continuationToken: "", 
          currentPrefixes: [], 
          prefixes: ["prefix-one", "prefix-two"], truncated: true}

        const received = await service.listBucketContents(payload)
        expect(received).toEqual(expected)
        expect(spy).toHaveBeenCalledTimes(1)
        spy.mockClear()
      })
    })
  })

  describe('should get object headers', () => {
    describe('when whitelist is set', () => {
      it('should get object headers for whitelisted buckets', async () => {
        MockDate.set('2020-01-02');
        service.setWhitelistedBuckets("one-bucket,another-bucket")
        const spy = jest.spyOn(AWS.S3.prototype, 'headObject');

        const payload = dtoFactory({bucket: "one-bucket", key: "key-1"}, GetAWSS3ObjectDto)
        const expected = {
          ContentType: "SomeContentType"
        }

        const received = await service.getObjectHeaders(payload)
        expect(received).toEqual(expected)
        expect(spy).toHaveBeenCalledTimes(1)
        spy.mockClear()
      })

      it('should not get object headers for not whitelisted buckets when whitelist is set', async () => {
        MockDate.set('2020-01-02');
        service.setWhitelistedBuckets("one-bucket,another-bucket")
        const spy = jest.spyOn(AWS.S3.prototype, 'headObject');

        const payload = dtoFactory({bucket: "not-allowed-bucket", key: "key-1"}, GetAWSS3ObjectDto)

        await expect(service.getObjectHeaders(payload)).rejects.toThrow(UnauthorizedException)
        expect(spy).toHaveBeenCalledTimes(0)
        spy.mockClear()        
      })
    })

    describe('when whitelist is not set', () =>{
      it('should list contents', async () => {
        MockDate.set('2020-01-02');
        service.setWhitelistedBuckets("one-bucket,another-bucket")
        const spy = jest.spyOn(AWS.S3.prototype, 'listObjectsV2');

        const payload = dtoFactory({bucket: "one-bucket"}, GetBucketContentRequestDto)
        const expected = {
          contents: [
            {eTag: undefined, friendlyName: "key-1", key: "key-1", lastUpdate: new Date("2020-01-02T00:00:00.000Z"), size: 1},
            {eTag: undefined, friendlyName: "key-2", key: "key-2", lastUpdate: new Date("2020-01-02T00:00:00.000Z"), size: 2},
            {eTag: undefined, friendlyName: "key-3", key: "key-3", lastUpdate: new Date("2020-01-02T00:00:00.000Z"), size: 3},
          ], 
          continuationToken: "", 
          currentPrefixes: [], 
          prefixes: ["prefix-one", "prefix-two"], truncated: true}

        const received = await service.listBucketContents(payload)
        expect(received).toEqual(expected)
        expect(spy).toHaveBeenCalledTimes(1)
        spy.mockClear()
      })
    })
  })


  describe('should get object versions', () => {
    describe('when whitelist is set', () => {
      it('should get object versions for whitelisted buckets', async () => {
        MockDate.set('2020-01-02');
        service.setWhitelistedBuckets("one-bucket,another-bucket")
        const spy = jest.spyOn(AWS.S3.prototype, 'listObjectVersions');

        const payload = dtoFactory({bucket: "one-bucket", key: "key-1"}, GetAWSS3ObjectDto)
        const expected = [
          {isLatest: true, key: "v100", updatedAt: new Date("2020-01-01T00:00:00.000Z"), versionId: "v100"}, 
          {isLatest: false, key: "v95", updatedAt: new Date("2019-01-01T00:00:00.000Z"), versionId: "v95"}, 
          {isLatest: false, key: "v90", updatedAt: new Date("2018-01-01T00:00:00.000Z"), versionId: "v90"}
        ]

        const received = await service.getObjectVersions(payload)
        expect(received).toEqual(expected)
        expect(spy).toHaveBeenCalledTimes(1)
        spy.mockClear()
      })

      it('should not get object versions for not whitelisted buckets when whitelist is set', async () => {
        MockDate.set('2020-01-02');
        service.setWhitelistedBuckets("one-bucket,another-bucket")
        const spy = jest.spyOn(AWS.S3.prototype, 'listObjectVersions');

        const payload = dtoFactory({bucket: "not-allowed-bucket", key: "key-1"}, GetAWSS3ObjectDto)

        await expect(service.getObjectVersions(payload)).rejects.toThrow(UnauthorizedException)
        expect(spy).toHaveBeenCalledTimes(0)
        spy.mockClear()        
      })
    })

    describe('when whitelist is not set', () =>{
      it('should get object versions when whitelist is not set', async () => {
        MockDate.set('2020-01-02');
        service.setWhitelistedBuckets("")
        const spy = jest.spyOn(AWS.S3.prototype, 'listObjectVersions');

        const payload = dtoFactory({bucket: "one-bucket", key: "key-1"}, GetAWSS3ObjectDto)
        const expected = [
          {isLatest: true, key: "v100", updatedAt: new Date("2020-01-01T00:00:00.000Z"), versionId: "v100"}, 
          {isLatest: false, key: "v95", updatedAt: new Date("2019-01-01T00:00:00.000Z"), versionId: "v95"}, 
          {isLatest: false, key: "v90", updatedAt: new Date("2018-01-01T00:00:00.000Z"), versionId: "v90"}
        ]

        const received = await service.getObjectVersions(payload)
        expect(received).toEqual(expected)
        expect(spy).toHaveBeenCalledTimes(1)
        spy.mockClear()
      })
    })
  })

  describe.only('should get object versions', () => {

    describe('can get a read stream', () =>{
      it('should get a read stream when whitelist is not set', async () => {
        MockDate.set('2020-01-02');
        service.setWhitelistedBuckets("")
        const sent = "THISISAREADABLESTREAM"
        const readableStream = Readable.from(sent)
        const spy = jest.spyOn(AWS.S3.prototype, 'getObject').mockImplementationOnce(() => { return {
          createReadStream: () => readableStream, 
          abort: undefined, eachPage: undefined,
          isPageable: undefined, send: undefined, on: undefined, onAsync: undefined, promise: undefined, startTime: undefined, httpRequest: undefined
        }});

        const payload = dtoFactory({bucket: "one-bucket", key: "key-1"}, GetAWSS3ObjectDto)


        const received = await new Promise((ok, ko) => {
          const readStream = service.getObjectReadStream(payload)
          expect(spy).toHaveBeenCalledTimes(1)
  
          readStream.on('data', (data) => {
            return ok(data)
          })
        })

        expect(sent).toEqual(received)

        spy.mockClear()
      })
    })
  })


});
