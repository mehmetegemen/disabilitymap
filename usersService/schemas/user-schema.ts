import { Document, Model, model, Schema } from "mongoose";
import IUser from "../interfaces/IUser";

export interface IUserModel extends IUser, Document {}

export const GeolocationSchema: Schema = new Schema({
  lat: Number,
  lon: Number,
});

export const UserSchema: Schema = new Schema({
  geolocation: GeolocationSchema,
  username: String,
});

export const User: Model<IUserModel> = model<IUserModel>(
  "User",
  UserSchema,
);
