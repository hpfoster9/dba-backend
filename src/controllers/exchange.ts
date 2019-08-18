import async from "async";
import crypto from "crypto";
import nodemailer from "nodemailer";
import passport from "passport";
import { Exchange, ExchangeDocument } from "../models/Exchange";
import { Request, Response, NextFunction } from "express";
import { IVerifyOptions } from "passport-local";
import { WriteError } from "mongodb";
import request from "express-validator";
import "../config/passport";



/**
 * GET /sellerList
 * get list of sellers
 */
export const createExchange = (req: Request, res: Response) => {
  const { name, loc, radius, sellers } = req.body;
  const exchange = new Exchange({
    name: name,
    loc: loc,
    radius: radius,
    sellers: sellers
  });
  exchange.save((err, ex) => {
    console.log(err);
    console.log(ex);
    res.send({ status: "success" });
  });
};


export const sellerList = (req: Request, res: Response) => {
  console.log("sellerList");
  Exchange.findOne({ name: req.body.name }, (err: any, exchange: ExchangeDocument) => {
    if (err) {
      res.send({ status: "exchange not found" });
    }
    else {
      res.send({ status: "success", sellers: exchange.sellers });
    }
  });
};

export const clearExchanges = (req: Request, res: Response, next: NextFunction) => {
  Exchange.deleteMany({}, (err) => { console.log(err); });
  res.send({ status: "success" });
};

export const printExchanges = (req: Request, res: Response, next: NextFunction) => {
  Exchange.find({}, (err, result) => {
    console.log(err);
    res.send({ status: "success", res: result });
  });
};