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
 * Create a new user account
 */
export const postSignup = (req: Request, res: Response) => {
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

  User.findOne({ id: id }, (err, existingUser) => {
    if (existingUser) {
      res.send({ success: false, msg: "user exists" });
    }
    else {
      user.save((err) => {
        if (err) {
          res.send({ success: false, msg: "save error" });
        }
        else {
          res.send({ status: "success" });
        }
      });
    }
  });
};

/**
 * POST /login
 * Checks to see if id is valid
 */
export const tryLogin = (req: Request, res: Response) => {
  User.findOne({ id: req.query.id }, (err, u) => {
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
 * updates the location of a user and update the exchanges
 */
export const updateLoc = (req: Request, res: Response) => {
  const { id, location } = req.body;

  User.findOneAndUpdate({ id: id }, { location: location }, (err, u) => {
    exchangeController.updateExchanges(u.id, location, res);
    if (err || !u) {
      res.send({ status: err ? err : "User not found" });
    }
    else {
      res.send({
        status: "success",
      });
    }
  });
};

/**
 * POST /updateSeller
 * update the seller section of user account
 */
export const updateSeller = (req: Request, res: Response) => {
  const { id, sellerSettings, seller } = req.body;

  User.findOneAndUpdate({ id: id }, { seller: seller, sellerSettings: seller ? sellerSettings : undefined }, (err, u) => {
    if (err || !u) {
      res.send({ status: err ? err : "User not found" });
    }
    else {
      res.send({
        status: "success"
      });
    }
  });
};

/**
 * PUT /clearUsers
 * Clears the DB of Users
 */
export const clearUsers = (req: Request, res: Response) => {
  User.deleteMany({}, (err) => {
    res.send({ status: err ? err : "success" });
  });
};

/**
 * PUT /getUsers
 * Returns all Users in DB
 */
export const getUsers = (req: Request, res: Response) => {
  User.find({}, (err, result) => {
    res.send({ status: err ? err : "success", res: result });
  });
};