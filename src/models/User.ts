import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  id: string;
  email: string;
  name: {
    fname: string,
    lname: string
  };
  location: {
    lat: number,
    long: number
  };
  seller: boolean;
  pendingBuyerTransaction: string;
  pendingSellerTransaction: string;
  sellerSettings: {
    amountToSell: number,
    discount: number
  };
  joinExchange: () => void;
}

const userSchema = new mongoose.Schema({
  id: { type: String, unique: true },
  email: { type: String, unique: true },
  name: {
    fname: String,
    lname: String
  },
  location: {
    lat: Number,
    long: Number
  },
  seller: Boolean,
  pendingBuyerTransaction: String,
  pendingSellerTransaction: String,
  sellerSettings: {
    amountToSell: Number,
    discount: Number
  }
}, { timestamps: true });

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.joinExchange = function () {
  console.log("joined exchange");
};

export const User = mongoose.model<UserDocument>("User", userSchema);
