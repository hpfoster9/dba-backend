import mongoose from "mongoose";
import { Timestamp } from "bson";

export interface TransactionDocument extends mongoose.Document {
  date: Date;
  buyer: {
    id: string,
    accepted: boolean
  };
  seller: {
    id: string,
    accepted: boolean
  };
  exchange: string;
  status: number;
  joinExchange: () => void;
}

const transactionSchema = new mongoose.Schema({
  date: Date,
  buyer: {
    id: String,
    accepted: Boolean
  },
  seller: {
    id: String,
    accepted: Boolean
  },
  exchange: String,
  status: Number
}, { timestamps: true });

/**
 * Helper method for getting user's gravatar.
 */
transactionSchema.methods.joinExchange = function (id: number) {
  console.log("add id to people");
};

export const Transaction = mongoose.model<TransactionDocument>("Transaction", transactionSchema);
