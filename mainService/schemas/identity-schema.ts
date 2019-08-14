import { Document, Model, model, Schema } from "mongoose";
import IIdentity from "../interfaces/IIdentity";

export interface IIdentityModel extends IIdentity, Document {}

export const IdentitySchema: Schema = new Schema({
  email: String,
  fullName: String,
  password: String,
  username: String,
});

export const Identity: Model<IIdentityModel> = model<IIdentityModel>(
  "Identity",
  IdentitySchema,
);
