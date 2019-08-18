import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { Transaction, TransactionDocument } from "../models/Transaction";
import { Request, Response, NextFunction } from "express";
import { UserDocument, User } from "../models/User";

import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import request from "express-validator";
import "../config/passport";



/**
 * post /connectbuyer
 * buyer pings seller
 */
export const connectBuyer = (req: Request, res: Response) => {
  console.log("connectBuyer");
  const { bId, sId, exchange } = req.body;
  const transaction = new Transaction({
    date: Date.now(),
    buyer: {
      id: bId,
      accepted: true
    },
    seller: {
      id: sId,
      accepted: false
    },
    exchange: exchange,
    status: 0
  });
  User.findOne({ id: sId }, (err, seller: UserDocument) => {
    if (err) {
      console.log(err);
    }
    else {
      console.log(seller);
    }
    if (seller.pendingSellerTransaction) {
      res.send({ status: "seller already has transaction" });
      return;
    }
    transaction.save((err) => {
      if (err) {
        console.log(err);
        res.send("save error");
      }
      User.findOneAndUpdate({ id: bId }, { pendingBuyerTransaction: transaction._id }, (err, doc, result) => {
        console.log("in buyer");
        if (err) {
          console.log(err);
        }
        console.log(doc);
        console.log(result);
        seller.updateOne({ pendingSellerTransaction: transaction._id }, (err, raw) => {
          console.log("in seller");
          if (err) {
            console.log(err);
          }
          console.log(raw);
          res.send({ status: "success" });
        });

      });
    });
  });
  // maybe findOne to get the seller and notify them of a pending transaction
};
/**
 * post /respondSeller
 * buyer pings seller
 */
export const respondSeller = (req: Request, res: Response, next: NextFunction) => {
  console.log("respondSeller");
  // maybe findOne to get the seller and notify them of a pending transaction
  const { sId, bId, accept } = req.body;
  User.findOne({ id: sId }, (err, prod) => {
    console.log(err);
    console.log(prod);
    if (prod.pendingSellerTransaction) {
      if (accept) {
        Transaction.findOneAndUpdate({ _id: prod.pendingSellerTransaction }, { seller: { id: sId, accepted: true } }, (err, trans) => {
          console.log(err);
          console.log(trans);
          res.send({ status: "accepted pending request" });
        });
      }
      else {
        User.findOneAndUpdate({ id: sId }, { pendingSellerTransaction: undefined }, (err, seller) => {
          console.log(err);
          console.log(seller);
          User.findOneAndUpdate({ id: bId }, { pendingBuyerTransaction: undefined }, (err, buyer) => {
            console.log(err);
            console.log(buyer);
            res.send({ status: "denied pending request" });
          });
        });
      }
    }
    else {
      res.send({ status: "no request" });
    }
  });
};

export const checkSellerTrans = (req: Request, res: Response, next: NextFunction) => {
  console.log("checkSellerTrans");
  // maybe findOne to get the seller and notify them of a pending transaction
  User.findOne({ id: req.body.id }, (err, prod) => {
    if (prod.pendingSellerTransaction) {
      Transaction.findOne({ _id: prod.pendingSellerTransaction }, (err, trans) => {
        res.send({ status: "pendi   ng seller transaction" });
      });
    }
    else {
      res.send({ status: "no requests pending" });
    }
  });
};

export const checkBuyerTrans = (req: Request, res: Response, next: NextFunction) => {
  console.log("checkBuyerTrans");
  // maybe findOne to get the seller and notify them of a pending transaction
  User.findOne({ id: req.body.id }, (err, prod) => {
    if (prod.pendingBuyerTransaction) {
      Transaction.findOne({ _id: prod.pendingBuyerTransaction }, (err, trans) => {
        if (trans.seller.accepted) {
          res.send({ status: "seller accepted" });
        }
        else {
          res.send({ status: "seller yet to accept" });
        }
      });
    }
    else {
      res.send({ status: "no requests pending" });
    }
  });
};

export const clearTransactions = (req: Request, res: Response, next: NextFunction) => {
  Transaction.deleteMany({}, (err) => { console.log(err); });
};

export const printTransactions = (req: Request, res: Response, next: NextFunction) => {
  Transaction.find({}, (err, result) => {
    console.log(err);
    res.send({ status: "success", res: result });
  });
};