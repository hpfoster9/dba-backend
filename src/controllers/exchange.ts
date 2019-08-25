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
 * POST /createExchange
 * Initialize exchange
 */
export const createExchange = (req: Request, res: Response) => {
  const { name, location, radius, people } = req.body;
  const exchange = new Exchange({
    name: name,
    location: location,
    radius: radius,
    people: people ? people : []
  });

  exchange.save((err) => {
    if (err) {
      res.send({ status: err });
    }
    else {
      res.send({ status: "success" });
    }
  });
};

/**
 * PUT /sellerList
 * Get list of sellers within exchange
 */
export const sellerList = (req: Request, res: Response) => {
  Exchange.findOne({ name: req.query.name }, (err: any, exchange: ExchangeDocument) => {
    if (err || !exchange) {
      res.send({ status: err ? err : "exchange not found" });
    }
    else {
      User.find({ id: { $in: exchange.people } }, (err, uArray) => {
        if (err) {
          res.send({ status: err });
        }
        else {
          const sellers = uArray.filter((u) => {
            return u.seller;
          }).map((user) => {
            return {
              name: user.name,
              id: user.id,
              discount: user.sellerSettings.discount
            };
          });
          res.send({ status: "success", sellers: sellers });
        }
      });
    }
  });
};

/**
 * Update exchanges based on new locations
 */
export const updateExchanges = (id: string, user_loc: any, res: Response) => {
  Exchange.find({}, (err, eArray) => {
    if (err) {
      res.send({ status: err });
    }
    else {
      eArray.forEach(ex => {
        const inRadius = (getDistance(user_loc, ex.location) <= ex.radius);
        const inList = ex.people.includes(id);

        if (inRadius && !inList) {
          ex.people.push(id);
          ex.save();
        }
        else if (!inRadius && inList) {
          ex.people.splice(ex.people.indexOf(id), 1);
          ex.save();
        }
      });
    }
  });
};


/**
 * PUT /clearExchanges
 * Clears the DB of Users
 */
export const clearExchanges = (req: Request, res: Response) => {
  Exchange.deleteMany({}, (err) => {
    res.send({ status: err ? err : "success" });
  });
};

/**
 * PUT /getExchanges
 * Returns all Exchange in DB
 */
export const getExchanges = (req: Request, res: Response) => {
  Exchange.find({}, (err, result) => {
    res.send({ status: err ? err : "success", res: result });
  });
};