import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  userId: string;
  restaurantId: string;
  orderId: string;
  rating: number;
  comment: string;
  userName: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    userId: { type: String, required: true, index: true },
    restaurantId: { type: String, required: true, index: true },
    orderId: { type: String, required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, default: "" },
    userName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IReview>("Review", ReviewSchema);
