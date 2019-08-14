import debug from "debug";
import restify, { IResolvedJsonClient } from "restify-clients";
import config from "../config/config";
import IAuthorizationResponse from "../interfaces/IAuthorizationResponse";
import IIdentity from "../interfaces/IIdentity";
import ISanitizedIdentity from "../interfaces/ISanitizedIdentity";
import { IIdentityModel } from "../schemas/identity-schema";

const log = debug("main:identities-rest");
const error = debug("main:identities-error");

const connectRest = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve(
        restify.createJsonClient({
          url: config.IDENTITY_SERVICE_URL as string,
          version: "*",
        }),
      );
    } catch (err) {
      error(`restify client connect error: ${err.stack}`);
    }
  }).then((client: any) => {
    // Server requires API Key
    // Login to server
    client.basicAuth("disabilitymap-mainservice", "f96e1fc4-06d6-4f0a-acb6-c703dc614cdd");
    return client;
  });
};

export async function create(data: IIdentity) {
  const { email, fullName, password, username } = data;
  try {
    const client = await connectRest();
    return new Promise((resolve, reject) => {
      client.post(
        "/identities",
        {
          email,
          fullName,
          password,
          username,
        },
        (err: any, req: Request, res: Response, obj: IIdentityModel) => {
          if (err) { return reject(err); }
          resolve(obj);
        },
      );
    });
  } catch (err) {
    error(`Rest create error: ${err.stack}`);
  }
}

export async function findByEmail(email: string) {
  try {
    const client = await connectRest();
    return new Promise((resolve, reject) => {
      client.get(
        `/identities/${email}`,
        (err: any, req: Request, res: Response, obj: IIdentityModel) => {
          if (err) { return reject(err); }
          resolve(obj);
        },
      );
    });
  } catch (err) {
    error(`Rest findByEmail error: ${err.stack}`);
  }
}

export async function findByUsername(username: string) {
  try {
    const client = await connectRest();
    return new Promise((resolve, reject) => {
      client.get(
        `/identities/${username}`,
        (err: any, req: Request, res: Response, obj: IIdentityModel) => {
          if (err) { return reject(err); }
          resolve(obj);
        },
      );
    });
  } catch (err) {
    error(`Rest findByUsername error: ${err.stack}`);
  }
}

export async function checkPassword(data: IIdentity) {
  const { userId, password } = data;
  try {
    const client = await connectRest();
    return new Promise<IAuthorizationResponse>((resolve, reject) => {
      client.post(
        `/identities/${userId}/authorization`,
        {
          id: userId,
          password,
        },
        (err: any, req: Request, res: Response, obj: IAuthorizationResponse) => {
          if (err) { return reject(err); }
          resolve(obj);
        },
      );
    });
  } catch (err) {
    error(`Rest checkPassword error: ${err.stack}`);
  }
}
