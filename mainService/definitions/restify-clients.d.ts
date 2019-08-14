declare module "restify-clients" {
  export function createJsonClient({  }: IJsonClient): IResolvedJsonClient;

  export interface IResolvedJsonClient extends Object {
    basicAuth(username: string, password: string): any;
  }

  export interface IJsonClient {
    url: string;
    version: string;
  }
}
