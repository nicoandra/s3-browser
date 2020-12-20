import { ListBucketsOutput } from "aws-sdk/clients/s3"

export class S3 {
    listBuckets(callback: Function) {
        const result : ListBucketsOutput = {
          Buckets: [
            {CreationDate: new Date("2020-01-02T00:00:00.000Z"), Name: "online-bucket-1"}, 
            {CreationDate: new Date("2020-01-02T00:00:00.000Z"), Name: "online-bucket-2"}, 
            {CreationDate: new Date("2020-01-02T00:00:00.000Z"), Name: "online-bucket-3"}
          ]
        }
        return callback(null, result)
      }

}