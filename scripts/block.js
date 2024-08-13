import * as Block from 'multiformats/block'
import * as codec from '@ipld/dag-cbor'
import { sha256 as hasher } from 'multiformats/hashes/sha2'

const value = { hello: 'world' }

// encode a block
let block = await Block.encode({ value, codec, hasher })

block.value // { hello: 'world' }
block.bytes // Uint8Array
block.cid   // CID() w/ sha2-256 hash address and dag-cbor codec

// you can also decode blocks from their binary state
block = await Block.decode({ bytes: block.bytes, codec, hasher })

// if you have the cid you can also verify the hash on decode
block = await Block.create({ bytes: block.bytes, cid: block.cid, codec, hasher })

console.log(block);