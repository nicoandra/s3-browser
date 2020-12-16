import { ApiProperty } from '@nestjs/swagger';
import { bool } from 'aws-sdk/clients/signer';

export class SetCredentialsRequestDto {
  @ApiProperty() region: string;
  @ApiProperty() accessKeyId: string;
  @ApiProperty() secretAccessKey: string;
}

export class ListAWSS3BucketObjectsDto {
  Bucket: string;
  ContinuationToken?: string;
  Delimiter: string = '/';
  FetchOwner: boolean = false;
  MaxKeys: number = 1000;
  Prefix: string = '';
}

export class GetBucketContentRequestDto {
  bucketName: string = '';
  prefixes?: string = '';
  continuationToken?: string = '';

  static fromParams = (
    params: GetBucketContentRequestDto,
  ): GetBucketContentRequestDto => {
    const result = new GetBucketContentRequestDto();
    result.bucketName = params.bucketName;
    result.prefixes = (params.prefixes || '')
      .split('|')
      .map((r) => r.replace(/\//g, ''))
      .join('|');
    result.continuationToken = params.continuationToken || '';
    return result;
  };

  toListAWSS3BucketObjectsDto = (): ListAWSS3BucketObjectsDto => {
    const result = new ListAWSS3BucketObjectsDto();
    result.Bucket = this.bucketName;
    this.continuationToken.length
      ? (result.ContinuationToken = this.continuationToken)
      : '';
    this.prefixes.length
      ? (result.Prefix = this.prefixes.split('|').join('/') + '/')
      : '';
    return result;
  };
}

export class GetBucketContentResponseDto {
  currentPrefixes: string[] = [];
  prefixes: string[] = [];
  contents: BucketElementDto[];
  truncated: boolean = false;
  continuationToken: string = '';

  static fromAwsResponse(
    response: AWS.S3.ListObjectsV2Output,
  ): GetBucketContentResponseDto {
    const result = new GetBucketContentResponseDto();
    result.truncated = response.IsTruncated || false;
    result.prefixes = response.CommonPrefixes?.map(
      (entry: AWS.S3.CommonPrefix) => {
        return entry.Prefix.substring(response.Prefix?.length || 0);
      },
    ).filter((s) => s.length > 0) || [];

    result.contents = response.Contents.map((row: AWS.S3.Object) =>
      BucketElementDto.fromAwsResponseContentRow(row, response.Prefix),
    );
    result.continuationToken = response.NextContinuationToken || '';
    result.currentPrefixes = response.Prefix?.split(`/`).filter(
      (s) => s.length > 0,
    ) || [];
    return result;
  }
}

export class BucketElementDto {
  key: string;
  lastUpdate: Date;
  eTag: string;
  size: number;
  friendlyName: string;

  static fromAwsResponseContentRow(
    row: AWS.S3.Object,
    prefix: string = '',
  ): BucketElementDto {
    const result = new BucketElementDto();
    result.key = row.Key;
    result.lastUpdate = row.LastModified;
    result.eTag = row.ETag;
    result.size = row.Size;
    result.friendlyName = row.Key.substring(prefix.length);
    return result;
  }
}

export class ObjectHeaders {
  contentLength: number = 0;
  contentType: string;
}

export class GetAWSS3ObjectDto {
  key: string;
  bucket: string;
  byteRangeStart?: number
  byteRangeEnd?: number
  versionId?: string

  toAwsGetObjectRequest(): AWS.S3.GetObjectRequest {
    const result = {
      Bucket: this.bucket,
      Key: this.key,
    };

    if (this.byteRangeEnd !== undefined && this.byteRangeStart !== undefined && (this.byteRangeStart < this.byteRangeEnd)) {
        result["Range"] = `bytes=${this.byteRangeStart}-${this.byteRangeEnd}`
    }

    if (this.versionId !== undefined) {
      result["VersionId"] = this.versionId
    }
    return result;
  }

  toAwsGetObjectVersionsRequest(): AWS.S3.ListObjectVersionsRequest {
    const result = {
      Bucket: this.bucket,
      Prefix: this.key,
      MaxKeys: 5
    };

    return result;
  }
}

export class GetObjectDto {
  headers: ObjectHeaders;
  readStream: ReadableStream;

  static fromAwsGetObjectResponse(response): GetObjectDto {
    const result = new GetObjectDto();
    const headers = new ObjectHeaders();
    headers.contentLength = response.ContentLength;
    headers.contentType = response.ContentType;
    result.headers = headers;
    result.readStream = response.readStream;
    return result;
  }
}

export class BucketAttributesDto {
  name: string
  createdAt: Date
}

export class GetAWSS3ObjectVersionsDto {
    key: string;
    bucket: string;
}

export class AWSS3ObjectVersionDto {
  key: string
  versionId: string
  isLatest: bool
  updatedAt: Date

  static fromAWSS3ListObjectVersionsOutput(data: AWS.S3.ListObjectVersionsOutput) : AWSS3ObjectVersionDto[] {
    return data.Versions.map((v: AWS.S3.ObjectVersion) => {
      const result = new AWSS3ObjectVersionDto()
      result.key = v.Key
      result.versionId = v.VersionId
      result.isLatest = v.IsLatest
      result.updatedAt = v.LastModified
      return result
    }).sort((a,b) => {
      switch(true) {
        case (a.updatedAt > b.updatedAt): return -1
        case (a.updatedAt < b.updatedAt): return 1
        default: return 0
      }
    })
  }
}
