import { CID } from 'multiformats/cid'
import * as json from 'multiformats/codecs/json'
import { sha256 } from 'multiformats/hashes/sha2'
import { base64 } from "multiformats/bases/base64"

const bytes = json.encode({ hello: 'world' })

const hash = await sha256.digest(bytes)
const cid = CID.create(1, json.code, hash)

console.log(cid.toString());
console.log(cid.toString(base64));