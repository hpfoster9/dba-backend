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
 * POST /connectBuyer
 * Buyer initiates request to seller
 */
export const connectBuyer = (req: Request, res: Response) => {
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
    if (err || !seller) {
      res.send({ status: err ? err : "seller not found" });
    }
    else if (seller.pendingSellerTransaction) {
      res.send({ status: "seller already has transaction" });
    }
    else {
      transaction.save((err) => {
        if (err) {
          res.send({ status: "save error" });
        }
        else {
          User.findOneAndUpdate({ id: bId }, { pendingBuyerTransaction: transaction._id }, (err, buyer) => {
            if (err || !buyer) {
              res.send({ status: err ? err : "buyer not found" });
            }
            else {
              seller.updateOne({ pendingSellerTransaction: transaction._id }, (err) => {
                if (err) {
                  res.send({ status: err });
                }
                else {
                  res.send({ status: "success" });
                }
              });
            }
          });
        }
      });
    }
  });
};

/**
 * POST /respondSeller
 * Seller responds to buyers request
 */
export const respondSeller = (req: Request, res: Response) => {
  const { sId, bId, accept } = req.body;
  User.findOne({ id: sId }, (err, seller) => {
    if (err || !seller) {
      res.send({ status: err ? err : "seller not found" });
    }
    else if (seller.pendingSellerTransaction) {
      if (accept) {
        Transaction.findOneAndUpdate({ _id: seller.pendingSellerTransaction }, { seller: { id: sId, accepted: true } }, (err, trans) => {
          if (err || !trans) {
            res.send({ status: err ? err : "transaction not found" });
          }
          else {
            res.send({ status: "accepted pending request" });
          }
        });
      }
      else {
        seller.updateOne({ pendingSellerTransaction: undefined }, (err) => {
          if (err) {
            res.send({ status: err });
          }
          else {
            User.findOneAndUpdate({ id: bId }, { pendingBuyerTransaction: undefined }, (err, buyer) => {
              if (err || !buyer) {
                res.send({ status: err ? err : "buyer not found" });
              }
              else {
                res.send({ status: "denied pending request" });
              }
            });
          }
        });
      }
    }
    else {
      res.send({ status: "no request" });
    }
  });
};

export const checkSellerTrans = (req: Request, res: Response) => {
  User.findOne({ id: req.query.id }, (err, prod) => {
    if (prod.pendingSellerTransaction) {
      Transaction.findOne({ _id: prod.pendingSellerTransaction }, (err, trans) => {
        res.send({ status: "pending seller transaction" });
      });
    }
    else {
      res.send({ status: "no requests pending" });
    }
  });
};

/**
 * POST /checkBuyerTrans
 * Buyer pings server to check for request updates
 */
export const checkBuyerTrans = (req: Request, res: Response) => {
  User.findOne({ id: req.query.id }, (err, buyer) => {
    if (err || !buyer) {
      res.send({ accepted: false, status: err ? err : "buyer not found" });
    }
    else if (buyer.pendingBuyerTransaction) {
      Transaction.findOne({ _id: buyer.pendingBuyerTransaction }, (err, trans) => {
        if (err || !trans) {
          res.send({ accepted: false, status: err ? err : "transaction not found" });
        }
        else if (trans.seller.accepted) {
          res.send({ accepted: true, status: "seller accepted" });
        }
        else {
          res.send({ accepted: false, status: "seller yet to accept" });
        }
      });
    }
    else {
      res.send({ accepted: false, status: "no requests pending" });
    }
  });
};

/**
 * PUT /clearTransactions
 * Clears the DB of Transactions
 */
export const clearTransactions = (req: Request, res: Response) => {
  Transaction.deleteMany({}, (err) => {
    res.send({ status: err ? err : "success" });
  });
};

/**
 * PUT /getTransactions
 * Returns all Transactions in DB
 */
export const getTransactions = (req: Request, res: Response) => {
  Transaction.find({}, (err, result) => {
    res.send({ status: err ? err : "success", res: result });
  });
};