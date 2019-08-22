import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { User, UserDocument } from "../models/User";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import request from "express-validator";
import "../config/passport";
import * as exchangeController from "./exchange";

/**
 * POST /signup
 * Create a new local account.
 */
export const postSignup = (req: Request, res: Response) => {
  console.log("postSignup");
  const { id, email, name, location, seller, pendingBuyerTransaction, pendingSellertransaction, sellerSettings } = req.body;
  const user = new User({
    id: id,
    email: email,
    name: name,
    location: location,
    seller: seller ? seller : false,
    pendingBuyerTransaction: pendingBuyerTransaction,
    pendingSellertransaction: pendingSellertransaction,
    sellerSettings: sellerSettings,
  });
  console.log("user");
  console.log(user);
  User.findOne({ id: id }, (err, existingUser) => {
    if (existingUser) {
      console.log(existingUser);
      res.send({ success: false, msg: "user exists" });
    }
    else {
      user.save((err) => {
        console.log(err);
        res.send({ status: "success" });
      });
    }
  });
};
export const tryLogin = (req: Request, res: Response) => {
  console.log(req);
  console.log(req.body);
  console.log(req.body.id);
  User.findOne({ id: req.body.id }, (err, u) => {
    if (err || !u) {
      res.send({ status: err ? err : "User not found" });
    }
    else {
      res.send({ status: "success" });
    }
  });
};
/**
 * POST /updateLoc
 * update the location
 */
export const updateLoc = (req: Request, res: Response) => {
  console.log("updateLoc");
  const { id, location } = req.body;
  // console.log(id);
  // console.log(location);
  User.findOneAndUpdate({ id: id }, { location: location }, (err, u) => {
    console.log(location);
    exchangeController.updateExchanges(u.id, location);
    res.send({
      status: "success",
    });
  });
};

/**
 * POST /updateLoc
 * update the location
 */
export const updateSeller = (req: Request, res: Response) => {
  console.log("updateSeller");
  const { id, sellerSettings, seller } = req.body;
  console.log(id);
  User.findOneAndUpdate({ id: id }, { seller: seller, sellerSettings: seller ? sellerSettings : undefined }, (err, u) => {
    console.log(u);
    res.send({
      status: err ? "user couldn't be found" : "success"
    });
  });
};

// Redundant?
export const checkSellerTrans = (req: Request, res: Response, next: NextFunction) => {
  console.log("checkSellerTrans");
  // maybe findOne to get the seller and notify them of a pending transaction
  const { id, amountToSell, discount, seller } = req.body.id;
  const newSettings = {
    amountToSell,
    discount
  };
  User.findOneAndUpdate({ id: id }, { seller: seller, sellerSettings: seller ? newSettings : undefined }, (err) => {
    res.send({
      status: err ? "user couldn't be found" : "success"
    });
  });
};

export const clearUsers = (req: Request, res: Response, next: NextFunction) => {
  User.deleteMany({}, (err) => { console.log(err); });
  res.send({ status: "success" });
};

export const printUsers = (req: Request, res: Response, next: NextFunction) => {
  User.find({}, (err, result) => {
    console.log(err);
    res.send({ status: "success", res: result });
  });
};