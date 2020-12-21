import { Test, TestingModule } from '@nestjs/testing';
import MockDate from 'mockdate'
import { CredentialsModule } from './../credentials/credentials.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import * as AWS from 'aws-sdk';
import { ListBucketsOutput } from 'aws-sdk/clients/s3';
import { dtoFactory } from './../common/dto'
import { BucketElementDto, GetAWSS3ObjectDto, GetBucketContentRequestDto, GetBucketContentResponseDto } from './dto';
import { UnauthorizedException } from '@nestjs/common';
import { assert } from 'console';

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

  describe.only('should get object headers', () => {
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

});
