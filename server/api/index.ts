import "dotenv/config";
import mongoose from "mongoose";
import { app } from "../src/app.js";
import { seedInitialData } from "../src/seed.js";

let connection: Promise<typeof mongoose> | undefined;
let isSeeded = false;
async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");
  if (!connection) {
    connection = mongoose.connect(process.env.MONGODB_URI);
  }
  await connection;
  if (!isSeeded) {
    isSeeded = true;
    await seedInitialData();
  }
}
export default async function handler(req: any, res: any) {
  try {
    await connectDatabase();
    return app(req, res);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Database connection failed" });
  }
}
