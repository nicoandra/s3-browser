import {
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CredentialsService } from './../credentials/credentials.service';
import * as AWS from 'aws-sdk';
import * as readline from 'readline';
import {
  AWSS3ObjectVersionDto,
  BucketAttributesDto,
  BucketReferenceDto,
  GetAWSS3ObjectDto,
  GetBucketContentRequestDto,
  GetBucketContentResponseDto,
} from './dto';

@Injectable()
export class S3Service {
  s3Client: AWS.S3;
  private whitelistedBuckets: false | string[] = false;

  constructor(
    @Inject(forwardRef(() => CredentialsService))
    private credentialsService: CredentialsService,
    private configService: ConfigService,
  ) {
    const whitelistedBuckets = this.configService.get<string>('S3_BROWSER_WHITELISTED_BUCKETS', '')
    this.setWhitelistedBuckets(whitelistedBuckets)
  }

  public setWhitelistedBuckets(buckets: string) : void {
    const whitelistedBuckets = buckets.split(',')
      .map((r: string) => r.trim())
      .filter((l) => l.length);

      this.whitelistedBuckets = false
    if (whitelistedBuckets.length) {
      this.whitelistedBuckets = whitelistedBuckets;
    }
  }

  public setClient(client: AWS.S3) {
    this.s3Client = client
  }

  private getClient(): AWS.S3 {
    if (this.s3Client === undefined) {
      const credentials = this.credentialsService.get();
      this.s3Client = new AWS.S3({ ...credentials, apiVersion: '2006-03-01' });
    }
    return this.s3Client;
  }

  public async listBuckets(): Promise<BucketAttributesDto[]> {
    if (this.whitelistedBuckets) {
      return this.whitelistedBuckets.map((bucket) => {
        return <BucketAttributesDto>{
          name: bucket,
          createdAt: new Date(),
        };
      });
    }
  
    this.getClient();
    return new Promise((ok, ko) => {
      this.s3Client.listBuckets(
        (err: AWS.AWSError, data: AWS.S3.ListBucketsOutput) => {
          if (err) return ko(err);
          return ok(data['Buckets']);
        },
      );
    }).then((buckets: [AWS.S3.Bucket]) => {
      return buckets.map((bucket) => {
        return <BucketAttributesDto>{
          name: bucket.Name,
          createdAt: bucket.CreationDate,
        };
      });
    });
  }

  public async listBucketContents(
    params: GetBucketContentRequestDto,
  ): Promise<GetBucketContentResponseDto> {
    this.validateGetAwsObjectRequest(params);
    this.getClient();
    const clientParams = params.toListAWSS3BucketObjectsDto();

    return new Promise((ok, ko) => {
      this.s3Client.listObjectsV2(
        clientParams,
        (err: AWS.AWSError, data: AWS.S3.ListObjectsV2Output) => {
          if (err) return ko(err);
          return ok(data);
        },
      );
    }).then((result) => {
      return GetBucketContentResponseDto.fromAwsResponse(result);
    });
  }

  public async getObjectHeaders(params: GetAWSS3ObjectDto): Promise<any> {
    this.validateGetAwsObjectRequest(params);

    this.getClient();

    return new Promise((ok, ko) => {
      const s3Params = params.toAwsGetObjectRequest();
      this.s3Client.headObject(
        s3Params,
        (err: AWS.AWSError, data: AWS.S3.GetObjectOutput) => {
          if (err) return ko(err);
          return ok(data);
        },
      );
    });
  }

  public async getObjectVersions(
    params: GetAWSS3ObjectDto,
  ): Promise<AWSS3ObjectVersionDto[]> {
    this.validateGetAwsObjectRequest(params);

    this.getClient();
    return new Promise((ok, ko) => {
      const s3Params = params.toAwsGetObjectVersionsRequest();
      this.s3Client.listObjectVersions(
        s3Params,
        (err: AWS.AWSError, data: AWS.S3.ListObjectVersionsOutput) => {
          if (err) return ko(err);
          return ok(data);
        },
      );
    }).then((data: AWS.S3.ListObjectVersionsOutput) => {
      return AWSS3ObjectVersionDto.fromAWSS3ListObjectVersionsOutput(data);
    });
  }

  public getObjectReadStream(params: GetAWSS3ObjectDto) {
    this.validateGetAwsObjectRequest(params);

    this.getClient();
    const s3Params = params.toAwsGetObjectRequest();
    return this.s3Client.getObject(s3Params).createReadStream();
  }

  private getObjectReadLineInterface(params: GetAWSS3ObjectDto) {
    this.validateGetAwsObjectRequest(params);
    return readline.createInterface({
      input: this.getObjectReadStream(params),
      terminal: false,
    });
  }

  public async *grepObject(params: GetAWSS3ObjectDto, words: string[] = []) {
    this.validateGetAwsObjectRequest(params);
    const reader = this.getObjectReadLineInterface(params);

    for await (const l of reader) {
      const match = words.reduce((match, word) => {
        return match && l.includes(word);
      }, true);

      if (match) yield l;
    }
  }

  private validateGetAwsObjectRequest(params: BucketReferenceDto): void {
    if (!this.whitelistedBuckets) return;
    if (this.whitelistedBuckets.includes(params.bucket)) return;
    throw new UnauthorizedException(
      "The requested bucket can't be accessed through this tool.",
    );
  }
}
