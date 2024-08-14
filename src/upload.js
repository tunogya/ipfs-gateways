import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2';
import s3Client from "./utils/s3Client.js";
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

// Amazon API Gateway quotas and important notes
// https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html
const PART_SIZE = 2 * 1024 * 1024; // 2MB per part

export const handler = async (event) => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No file provided." }),
      };
    }

    const file = Buffer.from(event.body, 'base64');
    const hash = await sha256.digest(file);
    const cid = CID.create(1, json.code, hash).toString();

    const contentType = event.headers['content-type'] || 'application/octet-stream';
    const bucketName = process.env.S3_BUCKET_NAME || "nostrbucket";
    const key = `ipfs/${cid}`;

    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: bucketName,
        Key: key,
      }));

      return {
        statusCode: 409,
        body: JSON.stringify({ message: "File already exists.", uri: `ipfs://${cid}`, httpUri: `https://ipfs.abandon.ai/ipfs/${cid}` }),
      };
    } catch (headError) {
      if (headError.name === 'NotFound') {
        const createMultipartUploadResponse = await s3Client.send(new CreateMultipartUploadCommand({
          Bucket: bucketName,
          Key: key,
          ContentType: contentType,
        }));

        const uploadId = createMultipartUploadResponse.UploadId;
        const totalParts = Math.ceil(file.length / PART_SIZE);
        const uploadPromises = [];

        for (let i = 0; i < totalParts; i++) {
          const start = i * PART_SIZE;
          const end = Math.min(start + PART_SIZE, file.length);
          const partBuffer = file.slice(start, end);

          // Push the upload part promise into the array
          uploadPromises.push(
            s3Client.send(new UploadPartCommand({
              Bucket: bucketName,
              Key: key,
              PartNumber: i + 1,
              UploadId: uploadId,
              Body: partBuffer,
            })).then(uploadPartResponse => ({
              ETag: uploadPartResponse.ETag,
              PartNumber: i + 1,
            }))
          );
        }

        // Wait for all parts to be uploaded
        const parts = await Promise.all(uploadPromises);

        await s3Client.send(new CompleteMultipartUploadCommand({
          Bucket: bucketName,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        }));

        return {
          statusCode: 200,
          body: JSON.stringify({
            uri: `ipfs://${cid}`,
            httpUri: `https://ipfs.abandon.ai/ipfs/${cid}`,
          }),
        };
      } else {
        console.error("S3 HeadObject Error:", headError);
        return {
          statusCode: 500,
          body: JSON.stringify({ error: "Failed to check file existence." }),
        };
      }
    }
  } catch (error) {
    console.error("Processing Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An error occurred during processing." }),
    };
  }
};