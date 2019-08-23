import mongoose from "mongoose";

export interface ExchangeDocument extends mongoose.Document {
  name: string;
  location: {
    latitude: number,
    longitude: number
  };
  radius: number;
  people: [string];
}

const exchangeSchema = new mongoose.Schema({
  name: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  radius: Number,
  people: [String],
}, { timestamps: true });

export const Exchange = mongoose.model<ExchangeDocument>("Exchange", exchangeSchema);
