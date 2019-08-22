import mongoose from "mongoose";

export interface ExchangeDocument extends mongoose.Document {
  name: string;
  location: {
    latitude: number,
    longitude: number
  };
  radius: number;
  people: [string];
  joinExchange: () => void;
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

/**
 * Helper method for getting user's gravatar.
 */
exchangeSchema.methods.joinExchange = function (id: number) {
  console.log("add id to people");
};

export const Exchange = mongoose.model<ExchangeDocument>("Exchange", exchangeSchema);
