import s3Client from "./utils/s3Client.js";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {PutObjectCommand} from "@aws-sdk/client-s3";

export const handler = async (event) => {
  try {
    const data = JSON.parse(event.body || "{}");
    const key = data.key;
    const contentType = data?.content_type || 'application/octet-stream';

    const
      command = new PutObjectCommand({
        Bucket: "nostrbucket",
        Key: key,
        ContentType: contentType,
      });
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({url: presignedUrl}),
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({message: "something went wrong."}),
    }
  }
}