import "dotenv/config";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { app } from "./app.js";
import { seedInitialData } from "./seed.js";

const port = Number(process.env.PORT ?? 4000);

async function connectToDatabase() {
  const uri = process.env.MONGODB_URI;
  if (uri && !process.env.FORCE_MEMORY_DB) {
    try {
      console.log(`Attempting connection to MongoDB at ${uri}...`);
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
      console.log("Connected to local/remote MongoDB successfully.");
      return;
    } catch (err) {
      console.warn("Could not connect to configured MongoDB. Falling back to in-memory MongoDB...");
    }
  }

  console.log("Starting embedded MongoDB instance (MongoMemoryServer)...");
  const mongoServer = await MongoMemoryServer.create();
  const memoryUri = mongoServer.getUri();
  await mongoose.connect(memoryUri);
  console.log(`Connected to in-memory MongoDB at ${memoryUri}`);

  process.on("SIGINT", async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    process.exit(0);
  });
  process.on("SIGTERM", async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
    process.exit(0);
  });
}

async function start() {
  await connectToDatabase();
  await seedInitialData();

  app.listen(port, () => {
    console.log(`=======================================================`);
    console.log(`🚗 DriveDeck API listening on http://localhost:${port}`);
    console.log(`🔑 Demo Accounts:`);
    console.log(`   - Admin: admin@dealership.com / Password123!`);
    console.log(`   - User:  user@dealership.com  / Password123!`);
    console.log(`=======================================================`);
  });
}

start().catch(error => {
  console.error("Failed to start API", error);
  process.exit(1);
});
