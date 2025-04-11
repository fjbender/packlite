import mongoose from 'mongoose';

// Define a more appropriate interface for the global cache
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Add the property to the global namespace without naming conflicts
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Get MongoDB URI from environment variables or use local MongoDB
// You can specify your MongoDB URI in .env.local file
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/packlite";

// Initialize cached connection variable using global cache
const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

// Set the global cache
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

/**
 * Connect to MongoDB using mongoose
 */
async function dbConnect() {
  // If we have a connection already, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is being established, wait for it
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log(`Connecting to MongoDB at ${MONGODB_URI}`);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((err) => {
        console.error('MongoDB connection error:', err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;