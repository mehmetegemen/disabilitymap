import { IGeolocation } from "./IUser";

export default interface ISanitizedUser {
  geolocation: IGeolocation;
  username: string;
}
