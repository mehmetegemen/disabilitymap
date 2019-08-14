import bcrypt from "bcrypt";
import { Document, Model, model, Schema } from "mongoose";
import IIdentity from "../interfaces/IIdentity";

export interface IIdentityModel extends IIdentity, Document {}

export const IdentitySchema: Schema = new Schema({
  email: String,
  fullName: String,
  password: String,
  username: String,
});

export async function passwordHash(password: string): Promise<string> {
  // 12 rounds take 200-300ms for different CPUs. 250ms is optimum
  const result = await bcrypt.hash(password, 12);
  return result;
}

export async function compareHashes(data: IComparedHashes) {
  const result = await bcrypt.compare(data.userPassword, data.recordedPassword);
  return result;
}

interface IComparedHashes {
  userPassword: string;
  recordedPassword: string;
}

export const Identity: Model<IIdentityModel> = model<IIdentityModel>(
  "Identity",
  IdentitySchema,
);
