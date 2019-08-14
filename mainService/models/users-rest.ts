import debug from "debug";
import restify, { IResolvedJsonClient } from "restify-clients";
import config from "../config/config";
import ISanitizedUser from "../interfaces/ISanitizedUser";
import IUser from "../interfaces/IUser";
import { IUserModel } from "../schemas/user-schema";

const log = debug("main:users-rest");
const error = debug("main:users-rest-error");

const connectRest = () => {
  return new Promise((resolve, reject) => {
    try {
      resolve(
        restify.createJsonClient({
          url: config.USERS_SERVICE_URL as string,
          version: "*",
        }),
      );
    } catch (err) {
      error(`restify client connect error: ${err.stack}`);
    }
  }).then((client: any) => {
    // Server requires API Key
    // Login to server
    client.basicAuth("disabilitymap-mainservice", "a6701e54-39fd-4bdf-8bb6-fbf0e82b7603");
    return client;
  });
};

export async function create(data: IUser) {
  const { username, geolocation } = data;
  try {
    const client = await connectRest();
    return new Promise((resolve, reject) => {
      client.post(
        "/users",
        {
          geolocation,
          username,
        },
        (err: any, req: Request, res: Response, obj: IUserModel) => {
          if (err) { return reject(err); }
          resolve(obj);
        },
      );
    });
  } catch (err) {
    error(`Rest create error: ${err.stack}`);
  }
}

export async function find(username: string) {
  try {
    const client = await connectRest();
    return new Promise((resolve, reject) => {
      client.get(
        `/users/${username}`,
        (err: any, req: Request, res: Response, obj: ISanitizedUser) => {
          if (err) { return reject(err); }
          resolve(obj);
        },
      );
    });
  } catch (err) {
    error(`Rest create error: ${err.stack}`);
  }
}

export async function listAll(data: {
  limit: number,
  skip: number,
} = {
  limit: 12,
  skip: 0,
}) {
  const { limit, skip } = data;
  try {
    const client = await connectRest();
    return new Promise((resolve, reject) => {
      client.get(
        `/users?limit=${limit}&skip=${skip}`,
        (err: any, req: Request, res: Response, obj: ISanitizedUser) => {
          if (err) { return reject(err); }
          resolve(obj);
        },
      );
    });
  } catch (err) {
    error(`Rest create error: ${err.stack}`);
  }
}
