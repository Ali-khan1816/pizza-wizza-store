import mongoose from "mongoose";

const MONGO_URL = process.env.DB_URL;

if (!MONGO_URL) {
  throw new Error("DB_URL missing — check your .env file");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function connect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGO_URL).then((m) => {
      console.log("MongoDB connected!");
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null;
    console.error("MongoDB connection failed:", error);
    throw error;
  }

  return cached.conn;
}

export default { connect };
