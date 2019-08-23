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

export const Transaction = mongoose.model<TransactionDocument>("Transaction", transactionSchema);
