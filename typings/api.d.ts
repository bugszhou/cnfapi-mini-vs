/**
 * Api接口定义
 */
declare namespace IMiAPI {
  interface IApiOpts<IReqData> {
    data?: IReqData;
    headers?: Record<string, string>;
    /**
     * 获取request队列对象，用于取消该次接口请求
     * @param task 小程序wx.request队列对象
     */
    getRequestTask?(task: any): any;
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
    type?: string;
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
    /**
     * 是否需要携带token
     */
    requiredToken?: boolean;
    /**
     * 是否跳过签名
     * true - 跳过签名
     * false - 参与签名
     */
    isSkipSign?: boolean;
    /**
     * 接口请求参数的类型声明，与单个请求参数type配置互斥；优先paramsTyping的类型
     */
    paramsTyping?: string;
  }

  /**
   * 服务端接口映射的类型定义集合
   */
  interface IApiList {
    [key: string]: IApiItem;
  }

  interface IApiOptions {
    baseURL: string;
    env: "weapp" | "aliapp" | "swan" | "ttapp";
    appKey: string;
    appCode: string;
    apiList: IApiList;
    resSuccessCallback?: any;
    openResInterceptor?: (opts?: any) => boolean;
    resInterceptor?: (
      serverData: any,
      next: (...opts: any) => any,
      ctx: any,
    ) => any;
  }
}
