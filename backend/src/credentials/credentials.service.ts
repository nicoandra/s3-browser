import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { CredentialsDto, SetCredentialsRequestDto } from './dto';

@Injectable()
export class CredentialsService {
    static credentials : CredentialsDto = {
        region: 'us-west-2',
        accessKeyId: process.env['AWS_ACCESS_KEY_ID'],
        secretAccessKey: process.env['AWS_SECRET_ACCESS_KEY'],
    }

    constructor(@Inject(forwardRef(()=>S3Service)) private s3Service : S3Service) {
        console.log("creds", CredentialsService.credentials, process.env)
    }

    save(payload: SetCredentialsRequestDto): CredentialsDto {
        /*CredentialsService.credentials = payload*/
        return CredentialsService.credentials
    }

    async validate() {
        try {
            await this.s3Service.listBuckets()
            return true
        } catch(ex) {
            console.error("Credentials don't seem valid:", ex)
            return false
        }
    }

    get() : CredentialsDto {
        return CredentialsService.credentials
    }
}
