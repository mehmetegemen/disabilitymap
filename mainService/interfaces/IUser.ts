export default interface IUser {
  username: string;
  geolocation: IGeolocation;
}

export interface IGeolocation {
  lat: number;
  lon: number;
}
