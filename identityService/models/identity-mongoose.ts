import debug from "debug";
import mongoose, { Model } from "mongoose";
import config from "../config/config";
import IIdentity from "../interfaces/IIdentity";
import { compareHashes, Identity, IIdentityModel, passwordHash } from "../schemas/identity-schema";
import idTypeOf, { TYPE_EMAIL, TYPE_USERNAME } from "../utils/getIdType";

const error = debug("identity:error");
const log = debug("identity:mongoose");

let db: mongoose.Connection;

export async function connectDB() {
  if (db) { return db; }
  await mongoose.connect(config.IDENTITY_MONGO_URL as string, { useNewUrlParser: true });
  db = mongoose.connection;
}

export async function createUser(data: IIdentity): Promise<IIdentityModel> {
  let hashedPassword = "";
  try {
    await connectDB();
    hashedPassword = await passwordHash(data.password as string);
  } catch (err) {
    error(`createUser function throws error, stack trace: ${err.stack}`);
  }
  return new Promise<IIdentityModel>((resolve, reject) => {
    Identity.create(
      {
        ...data,
        password: hashedPassword,
      }, (err: any, doc: IIdentityModel) => {
        if (err) { return reject(err); }
        resolve(doc);
      },
    );
  });
}

export async function findUserByEmail(email: string): Promise<IIdentityModel> {
  try {
    await connectDB();
  } catch (err) {
    error(`findUserByEmail function throws error, stack trace: ${err.stack}`);
  }
  return new Promise<IIdentityModel>((resolve, reject) => {
    Identity.findOne({ email }, (err: any, doc: IIdentityModel) => {
      if (err) { return reject(err); }
      resolve(doc);
    });
  });
}

export async function findUserByUsername(username: string): Promise<IIdentityModel> {
  try {
    await connectDB();
  } catch (err) {
    error(`findUserByUsername function throws error, stack trace: ${err.stack}`);
  }
  return new Promise<IIdentityModel>((resolve, reject) => {
    Identity.findOne({ username }, (err: any, doc: IIdentityModel) => {
      if (err) { return reject(err); }
      resolve(doc);
    });
  });
}

export function sanitize(data: IIdentityModel) {
  const { email, fullName, username } = data;

  // _id from MongoDB and password omitted for security reasons
  return {
    email,
    fullName,
    username,
  };
}

export async function passwordCheck(data: IIdentity & { id: string }) {
  let user;
  let result;
  let hashedPassword = "";
  try {
    await connectDB();
    if (idTypeOf(data.id) === TYPE_EMAIL) {
      user = await findUserByEmail(data.id);
    } else {
      user = await findUserByUsername(data.id);
    }
    hashedPassword = await passwordHash(data.password as string);
    result = await compareHashes({
      recordedPassword: user.password as string,
      userPassword: data.password as string,
    });
  } catch (err) {
    error(`passwordCheck function throws error, stack trace: ${err.stack}`);
  }
  if (!user) {
    return {
      check: false,
      id: data.id,
      message: "There is no such a user.",
    };
  } else if (((user.email === data.id) || (user.username === data.id)) && result === true) {
    return { check: true, id: data.id };
  } else {
    return { check: false, id: data.id, message: "Incorrect password." };
  }
}
