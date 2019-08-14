import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export default {
  register(req: Request, res: Response, next: NextFunction) {
    const geolocationSchema = Joi.object({
      lat: Joi.number().strict().required(),
      lon: Joi.number().strict().required(),
    });

    const mainSchema = {
      email: Joi.string().regex(/^[^@]+@[^\.]+\..+$/).required(),
      fullName: Joi.string().regex(/^[a-zA-Z\s]{2,128}$/).required(),
      geolocation: geolocationSchema.required(),
      password: Joi.string().required(),
      username: Joi.string().regex(/^[a-zA-Z0-9\-_]{4,64}$/).required(),
    };
    const { error } = Joi.validate(req.body, mainSchema);
    if (error) {
      switch (error.details[0].context!.key) {
        case "lon":
        case "lat":
          res.status(422).send({
            message: "Please click to a place on the map.",
            success: false,
          });
          break;
        default:
          res.status(422).send({
            message: "Broken format, check " + error.details[0].context!.key + ".",
            success: false,
          });
          break;
      }

    } else {
      next();
    }
  },
  authenticate(req: Request, res: Response, next: NextFunction) {
    const mainSchema = {
      id: Joi.string().required(),
      password: Joi.string().required(),
    };
    const { error } = Joi.validate(req.body, mainSchema);
    if (error) {
      res.send({
        message: "Broken format, check " + error.details[0].context!.key + ".",
        success: false,
      });
    } else {
      next();
    }
  },
};
