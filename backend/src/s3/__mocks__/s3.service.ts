import { Injectable } from '@nestjs/common';

@Injectable()
export class S3Service {
  public async listBuckets() {}
  public async listBucketContents() {}
  public getObjectHeaders() {}
  public getObjectVersions() {}
  public getObjectReadStream() {}
  public async *grepObject() {}
}
