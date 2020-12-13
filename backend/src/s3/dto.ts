import { ApiProperty } from '@nestjs/swagger';

export class SetCredentialsRequestDto {
    @ApiProperty() region: string
    @ApiProperty() accessKeyId: string
    @ApiProperty() secretAccessKey: string
}

export class ListAWSS3BucketObjectsDto {
    Bucket: string
    ContinuationToken?: string
    Delimiter: string = '/'
    FetchOwner: boolean = false
    MaxKeys: number = 5
    Prefix: string = ''
}

export class GetBucketContentRequestDto {
    bucketName : string = ''
    prefixes? : string = ''
    continuationToken? : string = ''

    static fromParams = (params: GetBucketContentRequestDto) : GetBucketContentRequestDto => {
        const result = new GetBucketContentRequestDto()
        result.bucketName = params.bucketName
        result.prefixes = (params.prefixes || '').split('|').map(r => r.replace(/\//g, '')).join('|')
        result.continuationToken = params.continuationToken || ''
        return result
    }

    toListAWSS3BucketObjectsDto = () : ListAWSS3BucketObjectsDto => {
        const result = new ListAWSS3BucketObjectsDto()
        result.Bucket = this.bucketName
        this.continuationToken.length ? result.ContinuationToken = this.continuationToken : ''
        this.prefixes.length ? result.Prefix = this.prefixes.split('|').join('/') + '/' : ''
        return result;
    }
}

export class GetBucketContentResponseDto {
    currentPrefixes: string[] = []
    prefixes: string[] = []
    contents: BucketElementDto[]
    truncated: boolean = false
    continuationToken: string = ''
    delimiter: string = '/'

    static fromAwsResponse(response: AWS.S3.ListObjectsV2Output) : GetBucketContentResponseDto {
        const result = new GetBucketContentResponseDto()
        result.truncated = response.IsTruncated
        result.prefixes = response.CommonPrefixes?.map((entry: AWS.S3.CommonPrefix) => {
            return entry.Prefix.substring(response.Prefix?.length || 0)
        }).filter((s) => s.length > 0)

        result.contents = response.Contents.map((row: AWS.S3.Object) => BucketElementDto.fromAwsResponseContentRow(row, response.Prefix))
        result.continuationToken = response.ContinuationToken || ''
        result.currentPrefixes = response.Prefix?.split(`/`).filter((s) => s.length > 0)
        return result
    }    
}

export class BucketElementDto {
    key: string
    lastUpdate: Date
    eTag: string
    size: number
    friendlyName: string

    static fromAwsResponseContentRow(row: AWS.S3.Object, prefix: string = '') : BucketElementDto {
        const result = new BucketElementDto()
        result.key = row.Key
        result.lastUpdate = row.LastModified
        result.eTag = row.ETag
        result.size = row.Size
        result.friendlyName = row.Key.substring(prefix.length)
        return result
    }
}

export class ObjectHeaders {
    contentLength: number = 0
    contentType: string 
}

export class GetAWSS3ObjectDto {
    key: string
    bucket: string

    toAwsGetObjectRequest() : AWS.S3.GetObjectRequest {
        const result = {
            Bucket: this.bucket,
            Key: this.key
        }
        return result;
    }
}

export class GetObjectDto {
    headers: ObjectHeaders
    readStream: ReadableStream

    static fromAwsGetObjectResponse(response) : GetObjectDto {
        const result = new GetObjectDto()
        const headers = new ObjectHeaders()
        headers.contentLength = response.ContentLength
        headers.contentType = response.ContentType
        result.headers = headers
        result.readStream = response.readStream
        return result
    }
}