import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoute from "./routes/auth.js";
import cors from "cors";
import { generalLimiter } from "./middlewares/rateLimit.js";

dotenv.config();

await connectDB();

const app = express();

app.use(cors());
app.use(express.json());
app.use(generalLimiter);
app.use("/api/auth", authRoute);

const PORT = process.env.PORT || 5007;

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
});
