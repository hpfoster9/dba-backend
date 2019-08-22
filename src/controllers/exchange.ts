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
import { User } from "../models/User";
import { UserDocument } from "../models/User";
import { getDistance } from "geolib";


/**
 * GET /sellerList
 * get list of sellers
 */
export const createExchange = (req: Request, res: Response) => {
  const { name, location, radius, people } = req.body;
  console.log(location);
  const exchange = new Exchange({
    name: name,
    location: location,
    radius: radius,
    people: people
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
    if (err || !exchange) {
      res.send({ status: "exchange not found" });
    }
    else {
      let sellers;
      User.find({ id: { $in: exchange.people } }, (err, uArray) => {
        sellers = uArray.filter((u) => { return u.seller; });
        res.send({ status: "success", sellers: sellers });
      });
    }
});
};

const insideExchange = (user_loc: any, ex: any) => {
  // geo distance: https://stackoverflow.com/questions/24680247/check-if-a-latitude-and-longitude-is-within-a-circle-google-maps
  const { radius, location } = ex;
  console.log(getDistance(location, user_loc));
  return getDistance(location, user_loc) <= radius;
};

export const updateExchanges = (id: string, user_loc: any) => {
  Exchange.find({}, (err, eArray) => {
    if (err || eArray.length === 0) {
      console.log(err);
    }
    else {
      eArray.forEach(ex => {
        console.log(ex);
        console.log(user_loc);
        console.log("****");
        const inRadius = insideExchange(user_loc, ex);
        const inList = ex.people.includes(id);
        if (inRadius && !inList) {
          console.log(`inside ${ex.name}`);
          ex.people.push(id);
          ex.save();
        }
        else if (!inRadius && inList) {
          ex.people.splice(ex.people.indexOf(id));
          ex.save();
        }
      });
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