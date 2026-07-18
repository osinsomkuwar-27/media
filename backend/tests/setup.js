import { MongoMemoryReplSet } from 'mongodb-memory-server';
import mongoose from 'mongoose';

// A single-node in-memory replica set so unlock's session.withTransaction()
// works exactly the same in tests as it does against Atlas, without ever
// touching the real database.
let replSet;

export async function connectTestDB() {
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
}

export async function closeTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  if (replSet) {
    await replSet.stop();
  }
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}