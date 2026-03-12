import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI) {
  throw new Error('MONGO_URI is not defined in environment variables');
}

declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const cached =
  global.mongooseCache ||
  (global.mongooseCache = {
    conn: null,
    promise: null,
  });

export const connectToDatabase = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error('MongoDB connection error:', e);
    throw e;
  }

  console.info('MongoDB connected successfully');
  return cached.conn;
};
