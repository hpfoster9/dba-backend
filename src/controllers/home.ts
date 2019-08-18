import { Request, Response } from "express";

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  console.log("we in here");
  res.send({status: "Success"});

  /*
  res.render("home", {
    title: "Home"
  });
  */
};
