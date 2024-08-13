import { CID } from 'multiformats/cid';
import * as json from 'multiformats/codecs/json';
import { sha256 } from 'multiformats/hashes/sha2';
import s3Client from "./utils/s3Client.js";
import {HeadObjectCommand, PutObjectCommand} from "@aws-sdk/client-s3";

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

    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `ipfs/${cid}`,
      }));

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "File already exists.", uri: `ipfs://${cid}` }),
      };
    } catch (headError) {
      if (headError.name === 'NotFound') {
        try {
          await s3Client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: `ipfs/${cid}`,
            Body: file,
            ContentType: contentType,
          }));

          return {
            statusCode: 200,
            body: JSON.stringify({
              uri: `ipfs://${cid}`,
            }),
          };
        } catch (s3Error) {
          console.error("S3 Error:", s3Error);
          return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to upload to S3." }),
          };
        }
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