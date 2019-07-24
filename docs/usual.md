## 使用文档

创建`apiList.js`文件，并且修改为：

```javascript
export default {
  // 调用的方法名称，例如：api.getList
  getList: {
    interval: 2000, // 每隔2秒重试一次
    retryTimes: 3, // 重试3次
    apiName: '/demoprj/member/phone', // 接口pathurl
    desc: '', // 接口描述
    method: 'POST',
    params: {
      // post参数
      post: [
        {
          param: 'app_key', // 参数名
          isNeed: 1, // 是否必须 1 为必须、0为非必须
        },
        {
          param: 'token', // 参数名
          isNeed: 1, // 是否必须 1 为必须、0为非必须
        },
        {
          param: 'type', // 参数名
          isNeed: 0, // 是否必须 1 为必须、0为非必须
        },
      ],
      get: [
        {
          param: 'sex', // 参数名
          isNeed: 0, // 是否必须 1 为必须、0为非必须
        },
      ],
    },
    // 需要参数签名的参数字段
    signKeys: ['app_key', 'token'],
  },
};
```

```javascript
import vsApi from './vsApi';
import apiList from './apiList';

export default vsApi({
  baseURL: '<baseURL>',
  env: 'weapp', // env 取值范围：[weapp, aliapp, swan, ttapp]；weapp -- 微信小程序，aliapp -- 支付宝小程序，swan -- 百度小程序，ttapp -- 头条小程序
  appKey: '<appKey>',
  appSecret: '<appSecret>'',
  apiList,
  // 是否开启拦截器，return true时会执行resInterceptor方法
  // 所有接口公用的拦截器
  // 建议这里处理token过期的逻辑
  openResInterceptor(res) {
    return res.retcode === <token过期retcode>;
  },
  // 拦截器serverData为服务端的数据
  resInterceptor(serverData, next) {
    // 建议这里重新获取token
    // 执行next，将重新发起原请求
    // next(err, data); next接受两个参数
    // err是返回错误数据，将中止请求，
    // data为传递给接口请求的数据，比如：
    // 接口A第一次发送请求token过期，执行了拦截器，我们获取到新的token值需要传递给重试请求
    // next(null, { data: { token: 'newToken' });
  },
});

```