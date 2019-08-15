import Api from 'cnfapi-miniprogram';
import { defaultSign } from 'mksign';

// eslint-disable-next-line
export default function(
  {
    baseURL = '',
    env = 'weapp',
    appKey = '',
    appSecret = '',
    apiList,
    resInterceptor,
    openResInterceptor,
    headers: {
      'Content-Type': 'application/json',
    },
  } = { apiList: {} },
) {
  const api = new Api({
    baseURL,
    env, // 使用环境：weapp - 微信小程序、aliapp - 支付宝小程序、swan - 百度小程序
    timeout: 10000, // 10s超时
    headers,
    resSuccessCallback(data, next) {
      if (data.retcode === 200) {
        next(null, data.data, data.retcode);
      } else {
        next({
          msg: data.msg,
          retcode: data.retcode,
        }, {}, data.retcode);
      }
    },
    openResInterceptor(res) {
      if (typeof openResInterceptor === 'function') {
        return openResInterceptor.call(this, res);
      }
      return false;
    },
    resInterceptor(serverData, next) {
      if (typeof resInterceptor === 'function') {
        return resInterceptor.bind(this)(serverData, next);
      }
      return next();
    },
  }, apiList);

  // eslint-disable-next-line
  api._before = function apiBefore(apiOpts, apiConf, next) {
    const { signKeys } = apiConf,
      signData = {};
    let { data } = apiOpts;
    if (!data) {
      data = {};
    }
    data.app_key = appKey;
    Object.keys(data).forEach((item) => {
      if (signKeys.indexOf(item) > -1) {
        signData[item] = data[item];
      }
    });
    data.sign = defaultSign(signData, [appSecret]);
    next({
      ...apiOpts,
      data,
    });
  };

  return api;
}
