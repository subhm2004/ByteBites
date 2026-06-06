import mongoose from "mongoose";

const connectDB = async (retries = 3) => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is missing in services/auth/.env");
    process.exit(1);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await mongoose.connect(uri, {
        dbName: "Zomato_Clone",
        serverSelectionTimeoutMS: 15000,
      });

      console.log("Connected to MongoDB (auth service)");
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt}/${retries} failed:`, error);

      if (attempt === retries) {
        console.error("\nCould not connect to MongoDB. Check:");
        console.error("1. Internet connection is working");
        console.error("2. MongoDB Atlas → Network Access → add your IP (or 0.0.0.0/0 for dev)");
        console.error("3. MONGO_URI in services/auth/.env is correct");
        process.exit(1);
      }

      await new Promise((resolve) => setTimeout(resolve, 2000 * attempt));
    }
  }
};

export default connectDB;
