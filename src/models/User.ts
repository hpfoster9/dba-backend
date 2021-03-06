import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  id: string;
  email: string;
  name: string;
  location: {
    latitude: number,
    longitude: number
  };
  seller: boolean;
  pendingBuyerTransaction: string;
  pendingSellerTransaction: string;
  sellerSettings: {
    amountToSell: number,
    discount: number
  };
}

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  email: String,
  name: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  seller: Boolean,
  pendingBuyerTransaction: String,
  pendingSellerTransaction: String,
  sellerSettings: {
    amountToSell: Number,
    discount: Number
  }
}, { timestamps: true });

export const User = mongoose.model<UserDocument>("User", userSchema);
