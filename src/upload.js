import { CID } from 'multiformats/cid'
import * as json from 'multiformats/codecs/json'
import { sha256 } from 'multiformats/hashes/sha2'
import s3Client from "./utils/s3Client.js";
import {PutObjectCommand} from "@aws-sdk/client-s3";

export const handler = async (event) => {
  try {
    const file = Buffer.from(event.body, 'base64');
    const hash = await sha256.digest(file);
    const cid = CID.create(1, json.code, hash).toString();

    const contentType = event.headers['content-type'];

    try {
      await s3Client.send(new PutObjectCommand({
        Bucket: "nostrbucket",
        Key: `ipfs/${cid}`,
        Body: file,
        ContentType: contentType,
      }));

      return {
        statusCode: 200,
        body: JSON.stringify({
          uri: `ipfs://${cid}`
        }),
      };
    } catch (e) {
      console.log(e)
      return {
        statusCode: 500,
        body: "Something went wrong.",
      }
    }
  } catch (e) {
      console.log(e);
      return {
        statusCode: 500,
        body: "Something went wrong.",
      }
  }
};
