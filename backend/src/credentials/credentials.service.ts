import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Service } from './../s3/s3.service';
import { CredentialsDto } from './dto';

@Injectable()
export class CredentialsService {
  static credentials: CredentialsDto;

  constructor(
    @Inject(forwardRef(() => S3Service)) private s3Service: S3Service,
    private configService: ConfigService,
  ) {
    CredentialsService.credentials = CredentialsDto.fromObject({
      region: this.configService.get<string>('AWS_REGION', 'us-east-2'),
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
    });
  }

  async validate() {
    try {
      await this.s3Service.listBuckets();
      return true;
    } catch (ex) {
      console.error("Credentials don't seem valid:", ex);
      return false;
    }
  }

  get(): CredentialsDto {
    return CredentialsService.credentials;
  }
}
