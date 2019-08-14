import debug from "debug";
import { Request, Response } from "express";
import hal from "hal";
import * as usersRestClient from "../models/users-rest";
const error = debug("main:error");

export default {
  async getGeolocation(req: Request, res: Response) {
    const { username } = req.params;
    const user: any = await usersRestClient.find(username);
    // Check if user exists
    if (user.success === false) {
      // User does not exist
      // Exit with failure
      res.send({
        message: "User does not exist",
        success: true,
      });
    }
    // User exists
    const userInfoCollection = new hal.Resource(
      {
        ...user.geolocation,
      },
      "/geolocation",
    );

    res.set("Content-Type", "application/hal+json");
    res.send(userInfoCollection.toJSON(" "));
  },
  async getAllUsersAdditionalInfo(req: Request, res: Response) {
    const { limit, skip } = req.query;
    const users = await usersRestClient.listAll({
      limit: limit && limit < 50 ? Number(limit) : 12,
      skip: skip ? Number(skip) : 0,
    });
    const userInfoCollection = new hal.Resource(
      {
        users,
      },
      "/users",
    );
    userInfoCollection.link("geolocation", {
      href: "/users/{username}/geolocation",
      method: "GET",
      templated: true,
    })
    
    res.set("Content-Type", "application/hal+json");
    res.send(userInfoCollection.toJSON(" "));
  },
};
