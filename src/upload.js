import { CID } from 'multiformats/cid'
import * as json from 'multiformats/codecs/json'
import { sha256 } from 'multiformats/hashes/sha2'

export const handler = async (event) => {
  try {
    const bytes = json.encode({ hello: 'world' })
  
    const hash = await sha256.digest(bytes)
    const cid = CID.create(1, json.code, hash).toV1().toString()
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        cidV1: cid,
      }),
    };
  } catch (e) {
      console.log(e);
      return {
        statusCode: 500,
        body: e,
      }
  }
};
