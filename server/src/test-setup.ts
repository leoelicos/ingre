import { beforeAll, afterAll } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongo: MongoMemoryServer

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()
  
  // Patch mongoose.connect to use the in-memory server
  const originalConnect = mongoose.connect.bind(mongoose)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mongoose.connect = (async (_url?: string, options?: mongoose.ConnectOptions) => {
    return originalConnect(uri, options)
  }) as any
})

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (mongo) {
    await mongo.stop()
  }
})
