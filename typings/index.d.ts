/// <reference path="./api.d.ts" />

export default function getApiInstance<IApiList>(
  opts: IMiAPI.IApiOptions,
): Api & IApiList;

declare class Api {
  constructor(options?: any);
  _before: (apiOpts: any, apiConf: any, next: (...opts: any) => any) => any;
  on: (eventName: string, evtData: Record<string, any>) => void;
}

declare module "cnfapi-mini-vs" {
  export = hash;
}
