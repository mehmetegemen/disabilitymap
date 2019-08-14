import debug from "debug";
import mongoose, { Model } from "mongoose";
import config from "../config/config";
import ISantiziedUser from "../interfaces/ISanitizedUser";
import IUser from "../interfaces/IUser";
import { IUserModel, User } from "../schemas/user-schema";

const error = debug("users:error");
const log = debug("users:mongoose");

let db: mongoose.Connection;

export async function connectDB() {
  if (db) {
    return db;
  }
  await mongoose.connect(config.USERS_MONGO_URL as string, {
    useNewUrlParser: true,
  });
  db = mongoose.connection;
}

export async function createUser(data: IUser): Promise<IUserModel> {
  try {
    await connectDB();
  } catch (err) {
    error(`createUser function throws error, stack trace: ${err.stack}`);
  }
  return new Promise<IUserModel>((resolve, reject) => {
    User.create(data, (err: any, doc: IUserModel) => {
      if (err) {
        return reject(err);
      }
      resolve(doc);
    });
  });
}

export async function findUserByUsername(
  username: string,
): Promise<IUserModel> {
  try {
    await connectDB();
  } catch (err) {
    error(
      `findUserByUsername function throws error, stack trace: ${err.stack}`,
    );
  }
  return new Promise<IUserModel>((resolve, reject) => {
    User.findOne({ username }, (err: any, doc: IUserModel) => {
      if (err) {
        return reject(err);
      }
      resolve(doc);
    });
  });
}

export function sanitizeUser(data: IUserModel) {
  const { username, geolocation } = data;
  return {
    geolocation: {
      lat: geolocation.lat,
      lon: geolocation.lon,
    },
    username,
  };
}

export async function listUsers(data: {
  limit: number,
  skip: number,
} = {
  limit: 12,
  skip: 0,
}) {
  const { skip, limit } = data;
  try {
    // Connect to database
    await connectDB();
  } catch (err) {
    error(`listUsers function throws error, stack trace: ${err.stack}`);
  }
  return new Promise<ISantiziedUser[]>((resolve, reject) => {
    User.find({})
      .skip(skip)
      .limit(limit)
      .exec((err, docs) => {
        if (err) { return reject(err); }
        // Resolve documents
        const sanitizedUsers = docs.map((doc) => sanitizeUser(doc));
        resolve(sanitizedUsers);
      });
  });
}
