import { Test, TestingModule } from '@nestjs/testing';
import MockDate from 'mockdate'
import { CredentialsModule } from './../credentials/credentials.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { S3Service } from './s3.service';
import * as AWS from 'aws-sdk';
import { ListBucketsOutput } from 'aws-sdk/clients/s3';

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

});
