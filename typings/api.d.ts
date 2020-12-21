declare namespace IMiAPI {
  interface IApiOpts<IReqData> {
    data?: IReqData;
    headers?: Record<string, string>;
  }

  interface IApiSuccess<IResData> {
    data: IResData | null;
    msg: string;
    retcode?: number | string;
  }

  interface IParam {
    param: string;
    isNeed: 0 | 1;
    required?: boolean;
    type: string;
  }

  interface IParams {
    post?: IParam[];
    get?: IParam[];
  }

  interface IApiItem {
    interval: number; // 每隔几秒重试一次
    retryTimes: number; // 重试次数
    apiName: string; // 服务端接口pathurl
    desc?: string; // 接口描述
    method: "POST" | "GET" | "PUT" | "post" | "get" | "put";
    params: IParams;
    log?: boolean;
    res?: string;
  }

  interface IApiList {
    [key: string]: IApiItem;
  }

  interface IApiOptions {
    baseURL: string;
    env: "weapp" | "aliapp" | "swan" | "ttapp";
    appKey: string;
    appCode: string;
    apiList: IApiList;
    resSuccessCallback: any;
    openResInterceptor: (opts?: any) => boolean;
    resInterceptor: (
      serverData: any,
      next: (...opts: any) => any,
      ctx: any,
    ) => any;
  }
}
