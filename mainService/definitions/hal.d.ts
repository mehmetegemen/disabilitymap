declare module "hal" {
  export class Resource {
    constructor(data: any, path: string);
    link(rel: string, linkDescriptObject: string | linkDescriptObject): void;
    toJSON(delimiter: string): string;
  }


  export interface linkDescriptObject {
    href: string;
    name?: string;
    hreflang?: string;
    title?: string;
    templated?: boolean;
    icon?: string;
    align?: string;
    method?: string;
  }
}