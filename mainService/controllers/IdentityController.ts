import debug from "debug";
import { Request, Response } from "express";
import hal from "hal";
import jwt from "jsonwebtoken";
import { ExtractJwt } from "passport-jwt";
import config from "../config/config";
import IIdentity from "../interfaces/IIdentity";
import IIdentityErrorResponse from "../interfaces/IIdentityErrorResponse";
import ISanitizedIdentity from "../interfaces/ISanitizedIdentity";
import IUser from "../interfaces/IUser";
import * as identitiesRestClient from "../models/identities-rest";
import * as usersRestClient from "../models/users-rest";
import idTypeOf, { TYPE_EMAIL } from "../utils/getIdType";

const error = debug("main:error");

interface IIdentityResponse
  extends ISanitizedIdentity,
    IIdentityErrorResponse {}

function jwtSignIdentity(identity: ISanitizedIdentity) {
  const ONE_YEAR = 60 * 60 * 24 * 365;
  return jwt.sign(identity, config.SECRET as string, {
    expiresIn: ONE_YEAR,
  });
}

export default {
  async login(req: Request, res: Response) {
    const { id, password } = req.body;
    if (!id || !password) {
      return res.status(401).send({
        message: "Missing credentials.",
        success: false,
      });
    }
    let identity;
    if (idTypeOf(id) === TYPE_EMAIL) {
      identity = await identitiesRestClient.findByEmail(id);
    } else {
      identity = await identitiesRestClient.findByUsername(id);
    }
    // Find user in database
    // User is found
    // Check if password is valid
    const authorizationResponse = await identitiesRestClient.checkPassword({
      password,
      userId: id,
    });
    const isPasswordValid = authorizationResponse!.check;
    if (!isPasswordValid) {
      return res.status(401).send({
        message: "Login information is incorrect.",
        success: false,
      });
    }

    const IdentityInfoCollection = new hal.Resource(
      {
        ...identity,
        token: jwtSignIdentity(identity as ISanitizedIdentity),
      },
      "/authorization",
    );

    res.set("Content-Type", "application/hal+json");
    res.send(IdentityInfoCollection.toJSON(" "));
  },
  async register(req: Request, res: Response) {
    const {
      username,
      password,
      email,
      fullName,
      geolocation,
    } = req.body as IIdentity & IUser;
    try {
      const identityByEmail = await identitiesRestClient.findByEmail(
        email as string,
      );
      const identityByUsername = await identitiesRestClient.findByUsername(
        username as string,
      );
      const isIdentityFound = () => {
        if (
          (identityByEmail as IIdentityResponse).success === false &&
          (identityByUsername as IIdentityResponse).success === false
        ) {
          return false;
        }
        return true;
      };

      if (isIdentityFound()) {
        return res.status(409).send({
          message: "User already exists.",
          success: false,
        });
      }

      // User does not exist
      // Begin to create
      const identity = await identitiesRestClient.create({
        email,
        fullName,
        password,
        username,
      });

      const additionalUserInfo = await usersRestClient.create({
        geolocation,
        username,
      });

      const identityInfoCollection = new hal.Resource(
        {
          ...identity,
          ...additionalUserInfo,
        },
        "/identities",
      );

      identityInfoCollection.link("authentication", {
        href: "/identities/authentication",
        method: "POST",
      });

      res.set("Content-Type", "application/hal+json");
      res.send(identityInfoCollection.toJSON(" "));
    } catch (err) {
      error(`Register controller error: ${err.stack}`);
      res.status(500).send({
        message: "Register error.",
        success: false,
      });
    }
  },
};
