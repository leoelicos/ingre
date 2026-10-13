import { beforeAll, afterAll } from '@jest/globals'
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let mongo: MongoMemoryServer

beforeAll(async () => {
  mongo = await MongoMemoryServer.create()
  const uri = mongo.getUri()

  // tests connect with `${process.env.MONGO_TEST_URI}<db name>`
  process.env['MONGO_TEST_URI'] = uri
})

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  if (mongo) {
    await mongo.stop()
  }
})
