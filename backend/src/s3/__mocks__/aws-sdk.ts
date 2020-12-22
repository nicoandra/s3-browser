import { AWSError } from "aws-sdk";
import { ListBucketsOutput, ListObjectsV2Output, CommonPrefixList, CommonPrefix, ObjectList, Object, ListObjectsV2Request, HeadObjectRequest, HeadObjectOutput, ListObjectVersionsRequest, ListObjectVersionsOutput, GetObjectOutput, GetObjectRequest } from "aws-sdk/clients/s3"

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

      listObjectsV2(params: ListObjectsV2Request, callback: Function) {
        const result : ListObjectsV2Output = {
          IsTruncated: true,
          CommonPrefixes: <CommonPrefixList>[
            <CommonPrefix>{ Prefix: "prefix-one"},
            <CommonPrefix>{ Prefix: "prefix-two"},
          ],
          Contents: <ObjectList>[
            <Object>{Key: 'key-1', LastModified: new Date(), Size: 1},
            <Object>{Key: 'key-2', LastModified: new Date(), Size: 2},
            <Object>{Key: 'key-3', LastModified: new Date(), Size: 3},
          ]
        }
        return callback(null, result);
      }

      headObject(params: HeadObjectRequest, callback: Function) {
        const result : HeadObjectOutput = {
          ContentType: "SomeContentType"
        }
        return callback(null, result);
      }

      listObjectVersions(s3Params: ListObjectVersionsRequest, callback: Function) {
        const result : ListObjectVersionsOutput = {
          Versions: [
            {Key: 'v100', VersionId: 'v100', IsLatest: true, LastModified: new Date("2020-01-01 00:00:00+0") },
            {Key: 'v90', VersionId: 'v90', IsLatest: false, LastModified: new Date("2018-01-01 00:00:00+0") },
            {Key: 'v95', VersionId: 'v95', IsLatest: false, LastModified: new Date("2019-01-01 00:00:00+0") }
          ]
        }
        return callback(null, result)
      }

      getObject(s3Params: GetObjectRequest) {

      }
}