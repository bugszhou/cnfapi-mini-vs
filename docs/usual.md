## 使用文档

- **参与签名的字段中，如果值为null/undefined/空字符串，将不参与签名**

### 安装

```shell
npm install -S cnfapi-mini-vs
```

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
        {
          param: 'sign', // 参数名
          isNeed: 1, // 是否必须 1 为必须、0为非必须
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
import vsApi from 'cnfapi-mini-vs';
import apiList from './apiList';

const api =  vsApi({
  baseURL: '<baseURL>',
  env: 'weapp', // env 取值范围：[weapp, aliapp, swan, ttapp]；weapp -- 微信小程序，aliapp -- 支付宝小程序，swan -- 百度小程序，ttapp -- 头条小程序
  appKey: '<appKey>',
  appCode: '<appSecret>', // 参与签名的appSecret
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

export default api;
```

接口调用方式

```javascript
// app_key和sign内部封装自动注入到传递到请求接口参数
api.getList({
     getRequestTask: (tesk) => {}, // 获取请求任务对象task，task对象可对中断请求任务等功能
    data: {
        token: 'mockToken',
        type: 1,
        sex: 1,
    }
})
.then(res => {
    console.log(res);
})
.catch(err => {
    console.log(err);
});
```
- task功能[点击查看](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/RequestTask.html)

### 钩子函数

1. 发送请求前`cnfapi:req:before`

```javascript
api.on('cnfapi:req:before', (data) => {
    // 业务逻辑
});
```

2. 请求成功`cnfapi:res:resolve`

```javascript
api.on('cnfapi:res:resolve', (data) => {
    // 业务逻辑
});
```

3. 请求reject`cnfapi:res:reject`

```javascript
api.on('cnfapi:res:reject', (data) => {
    // 业务逻辑
});
```

4. 请求发生错误`cnfapi:res:catch`

```javascript
api.on('cnfapi:res:catch', (data) => {
    // 业务逻辑
});
```
