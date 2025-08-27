import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

declare global {
  var mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}

let cached = global.mongooseCache as { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not set. Add it to your environment variables.");
  }
  if (cached!.conn) return cached!.conn;
  // Retry connecting a few times with exponential backoff to handle transient
  // network hiccups. Also ensure that if a connect attempt fails we clear
  // cached!.promise so subsequent attempts aren't stuck awaiting a rejected promise.
  const poolSize = Number(process.env.MONGODB_POOL_SIZE) || 10;
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    if (!cached!.promise) {
      cached!.promise = mongoose.connect(MONGODB_URI as string, {
        dbName: process.env.MONGODB_DB || "patharwalay",
        maxPoolSize: poolSize,
        // a slightly longer selection timeout to tolerate brief spikes
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 45000,
        family: 4,
      });
    }

    try {
      cached!.conn = await cached!.promise;
      return cached!.conn;
    } catch (err) {
      // clear the rejected promise so next loop iteration can create a new one
      // and allow backoff before retrying
      // eslint-disable-next-line no-console
      console.warn(`Mongo connect attempt ${attempt} failed: ${String(err)}`);
      cached!.promise = null;
      if (attempt === maxAttempts) throw err;
      // exponential backoff: 500ms, 1000ms, 2000ms
      const backoff = 500 * Math.pow(2, attempt - 1);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((res) => setTimeout(res, backoff));
    }
  }
  // should never reach here
  throw new Error("Unable to connect to MongoDB");
}



