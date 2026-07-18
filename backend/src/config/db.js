import mongoose from 'mongoose';
import env from './env.js';

export async function connectDB() {
  if (!env.mongodbUri) {
    throw new Error('MONGODB_URI is not set. Check your .env file.');
  }

  mongoose.set('strictQuery', true);

  await mongoose.connect(env.mongodbUri);

  console.log(`MongoDB connected: ${mongoose.connection.host}`);

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
}