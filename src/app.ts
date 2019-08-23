import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import dotenv from "dotenv";
import mongo from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import expressValidator from "express-validator";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";

const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import * as homeController from "./controllers/home";
import * as userController from "./controllers/user";
import * as exchangeController from "./controllers/exchange";
import * as transactionController from "./controllers/transaction";


// API keys and Passport configuration
import * as passportConfig from "./config/passport";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;

mongoose.connect(mongoUrl, { useNewUrlParser: true, useCreateIndex: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 1408);
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "pug");
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    url: mongoUrl,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
// mongoose.set("useFindAndModify", false);


app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
app.get("/", homeController.index);
app.post("/signup", userController.postSignup);
app.post("/login", userController.tryLogin);
app.put("/updateLoc", userController.updateLoc);
app.get("/sellerList", exchangeController.sellerList);
app.post("/updateSeller", userController.updateSeller);
app.post("/connectBuyer", transactionController.connectBuyer);
app.post("/respondSeller", transactionController.respondSeller);
app.get("/checkSellerTrans", transactionController.checkSellerTrans);
app.get("/checkBuyerTrans", transactionController.checkBuyerTrans);
// app.post("/rateTransaction");
app.post("/createExchange", exchangeController.createExchange);

app.put("/clearUsers", userController.clearUsers);
app.put("/clearExchanges", exchangeController.clearExchanges);
app.put("/clearTransactions", transactionController.clearTransactions);

app.get("/printUsers", userController.printUsers);
app.get("/printExchanges", exchangeController.printExchanges);
app.get("/printTransactions", transactionController.printTransactions);
export default app;
