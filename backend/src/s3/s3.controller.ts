import { Controller, Get, Inject, Param, Query, Res } from '@nestjs/common';
import {
  GetAWSS3ObjectDto,
  GetBucketContentRequestDto,
  GetBucketContentResponseDto,
} from './dto';
import { S3Service } from './s3.service';
import * as readline from 'readline';
import { Readable } from 'stream'


@Controller('s3')
export class S3Controller {
  constructor(@Inject(S3Service) private s3Service: S3Service) {}

  @Get('/')
  async get() {
    const buckets = await this.s3Service.listBuckets();
    return buckets['Buckets'].map((bucket) => {
      return {
        name: bucket.Name,
        createdAt: bucket.CreationDate,
      };
    });
  }

  @Get('/:bucketName/:prefixes?')
  async listContent(
    @Param('bucketName') bucketName: string,
    @Param('prefixes') prefixes: string,
    @Query() queryParams: GetBucketContentRequestDto,
  ) {
    const params = GetBucketContentRequestDto.fromParams({
      bucketName,
      prefixes,
      ...queryParams,
    });
    const result = await this.s3Service.listBucketContents(
      params.toListAWSS3BucketObjectsDto(),
    );
    return GetBucketContentResponseDto.fromAwsResponse(result);
  }

  @Get('/:bucketName/:object/download')
  async getObject(
    @Param('bucketName') bucketName: string,
    @Param('object') key: string,
    @Res() res,
  ) {
    const params = { bucket: bucketName, key: decodeURIComponent(key) };
    const request = new GetAWSS3ObjectDto();
    request.bucket = bucketName;
    request.key = key;

    const s3Object = await this.s3Service.getObjectHeaders(request);
    res.append('Content-Type', s3Object.ContentType);
    res.append('Content-Length', s3Object.ContentLength);
    this.s3Service.getObjectReadStream(request).pipe(res);
  }

  @Get('/:bucketName/:object/peek')
  async peekObject(
    @Param('bucketName') bucketName: string,
    @Param('object') key: string,
    @Res() res,
  ) {
    const request = new GetAWSS3ObjectDto();
    request.bucket = bucketName;
    request.key = key;
    request.byteRangeStart = 0
    request.byteRangeEnd = 256 * 1024

    const s3Object = await this.s3Service.getObjectHeaders(request);
    res.append('Content-Type', s3Object.ContentType);
    this.s3Service.getObjectReadStream(request).pipe(res);
  }  

  @Get('/:bucketName/:object/grep')
  async grepObject(
    @Param('bucketName') bucketName: string,
    @Param('object') key: string,
    @Query('text') text: string,
    @Res() res,
  ) {
    const request = new GetAWSS3ObjectDto();
    request.bucket = bucketName;
    request.key = key;

    const s3Object = await this.s3Service.getObjectHeaders(request);
    res.append('Content-Type', s3Object.ContentType);

    const readLine = readline.createInterface({
        input: this.s3Service.getObjectReadStream(request),
        terminal: false
      });
  
    readLine.on('line', (l) => {
        if (l.includes(text)) res.write(l + "\n")
    })

    readLine.on('close', () => {
        res.end()
    })    
  } 
}
