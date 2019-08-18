import mongoose from "mongoose";

export interface ExchangeDocument extends mongoose.Document {
  name: string;
  loc: {
    lat: number,
    long: number
  };
  radius: number;
  sellers: [string];
  joinExchange: () => void;
}

const exchangeSchema = new mongoose.Schema({
  name: String,
  loc: {
    lat: Number,
    long: Number
  },
  radius: Number,
  sellers: [String],
}, { timestamps: true });

/**
 * Helper method for getting user's gravatar.
 */
exchangeSchema.methods.joinExchange = function (id: number) {
  console.log("add id to people");
};

export const Exchange = mongoose.model<ExchangeDocument>("Exchange", exchangeSchema);
