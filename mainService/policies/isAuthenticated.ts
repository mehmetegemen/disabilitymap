import { NextFunction, Request, Response } from "express";
import passport from "passport";

export default (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate("jwt", (err, user) => {
    if (err || !user) {
      res.status(401).send({
        message: "You do not have access.",
        success: false,
      });
    } else {
      req.user = user;
      next();
    }
  })(req, res, next);
};
