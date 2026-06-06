import mongoose, { Schema, Document } from "mongoose";

export interface IRiderReview extends Document {
  userId: string;
  riderId: string;
  orderId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

const RiderReviewSchema = new Schema<IRiderReview>(
  {
    userId: { type: String, required: true, index: true },
    riderId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "" },
    userName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IRiderReview>("RiderReview", RiderReviewSchema);
