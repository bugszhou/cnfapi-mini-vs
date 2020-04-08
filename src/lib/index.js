import Api from 'cnfapi-miniprogram';
import sha256 from 'hash.js/lib/hash/sha/256';

// eslint-disable-next-line
export default function(
  {
    baseURL = '',
    env = 'weapp',
    appKey = '',
    appCode = '',
    apiList,
    resInterceptor,
    openResInterceptor,
    resSuccessCallback,
    headers = {
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
      if (resSuccessCallback && typeof resSuccessCallback === 'function') {
        return resSuccessCallback(data, next);
      }
      if (data.code === 200) {
        return next(null, data.data, data.code);
      }
      return next({
        msg: data.msg,
        retcode: data.code,
      }, {}, data.code);
    },
    openResInterceptor(res) {
      if (typeof openResInterceptor === 'function') {
        return openResInterceptor.call(this, {
          ...res,
          retcode: res ? res.code : '',
        });
      }
      return false;
    },
    resInterceptor(serverData, next) {
      if (typeof resInterceptor === 'function') {
        return resInterceptor.bind(this)(serverData, next, this);
      }
      return next();
    },
  }, apiList);

  // eslint-disable-next-line
  api._before = function apiBefore(apiOpts, apiConf, next) {
    const { isSkipSign, params } = apiConf;
    let { data } = apiOpts;
    if (!isSkipSign) {
      let signData = {};
      if (data === null || data === undefined) {
        data = {};
        signData = data;
      }
      let postDataKeys = [];
      if (params && Array.isArray(params.post)) {
        postDataKeys = params.post;
      }
      postDataKeys.forEach((item) => {
        const val = data[item.param];
        if (val !== null && val !== undefined) {
          signData[item.param] = val;
        }
      });
      if (!apiConf.headers) {
        // eslint-disable-next-line
        apiConf.headers = {};
      }
      // eslint-disable-next-line
      apiConf.headers['Authorization-AppKey'] = appKey;
      // eslint-disable-next-line
      apiConf.headers['Authorization-Sign'] = sha256().update(`${appKey}${JSON.stringify(signData)}${apiConf.headers['Authorization-Token'] || ''}${appCode}`).digest('hex');
    }
    next({
      ...apiOpts,
      data,
    });
  };

  return api;
}
