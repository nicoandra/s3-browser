import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CredentialsService } from './../credentials/credentials.service'
import * as AWS from 'aws-sdk'
import { GetAWSS3ObjectDto, ListAWSS3BucketObjectsDto } from './dto';

@Injectable()
export class S3Service {

    s3Client: AWS.S3

    constructor(@Inject(forwardRef(()=>CredentialsService)) private credentialsService : CredentialsService){}

    getClient() {
        if (this.s3Client === undefined) {
            const credentials = this.credentialsService.get()
            this.s3Client = new AWS.S3({...credentials, apiVersion: '2006-03-01'})
        }
        return this.s3Client
    }

    async listBuckets() {
        this.getClient()
        return new Promise((ok, ko) => {
            this.s3Client.listBuckets((err: AWS.AWSError, data: AWS.S3.ListBucketsOutput) => {
                if (err) return ko(err)
                return ok(data)
            })
        })
    }

    async listBucketContents(params: ListAWSS3BucketObjectsDto) {
        this.getClient()
        return new Promise((ok, ko) => {
            this.s3Client.listObjectsV2(params, (err: AWS.AWSError, data: AWS.S3.ListObjectsV2Output) => {
                if (err) return ko(err)
                return ok(data)
            })
        })
    }

    async getObject(params: GetAWSS3ObjectDto) : Promise<any>{
        this.getClient()
        return new Promise((ok, ko) => {
            const s3Params = params.toAwsGetObjectRequest()
            this.s3Client.getObject(s3Params, (err: AWS.AWSError, data: AWS.S3.GetObjectOutput) => {
                if (err) return ko(err)
                return ok(data)
            })
        })
    }    

    getObjectReadStream(params: GetAWSS3ObjectDto) {
        this.getClient()
        const s3Params = params.toAwsGetObjectRequest()
        return this.s3Client.getObject(s3Params).createReadStream()
    }      
}
