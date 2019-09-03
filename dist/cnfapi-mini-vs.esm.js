import Api from 'cnfapi-miniprogram';
import { defaultSign } from 'mksign';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

var defineProperty = _defineProperty;

function ownKeys(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);enumerableOnly&&(symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable})),keys.push.apply(keys,symbols);}return keys}function _objectSpread(target){for(var source,i=1;i<arguments.length;i++)source=null==arguments[i]?{}:arguments[i],i%2?ownKeys(source,!0).forEach(function(key){defineProperty(target,key,source[key]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(target,Object.getOwnPropertyDescriptors(source)):ownKeys(source).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key));});return target}function vsApi(){var _ref=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{apiList:{}},_ref$baseURL=_ref.baseURL,baseURL=void 0===_ref$baseURL?"":_ref$baseURL,_ref$env=_ref.env,env=void 0===_ref$env?"weapp":_ref$env,_ref$appKey=_ref.appKey,appKey=void 0===_ref$appKey?"":_ref$appKey,_ref$appCode=_ref.appCode,appCode=void 0===_ref$appCode?"":_ref$appCode,apiList=_ref.apiList,_resInterceptor=_ref.resInterceptor,_openResInterceptor=_ref.openResInterceptor,_resSuccessCallback=_ref.resSuccessCallback,_ref$headers=_ref.headers,headers=void 0===_ref$headers?{"Content-Type":"application/json"}:_ref$headers,api=new Api({baseURL:baseURL,env:env,timeout:1e4,headers:headers,resSuccessCallback:function resSuccessCallback(data,next){return _resSuccessCallback&&"function"==typeof _resSuccessCallback?_resSuccessCallback(data,next):200===data.retcode?next(null,data.data,data.retcode):next({msg:data.msg,retcode:data.retcode},{},data.retcode)},openResInterceptor:function openResInterceptor(res){return "function"==typeof _openResInterceptor&&_openResInterceptor.call(this,res)},resInterceptor:function resInterceptor(serverData,next){return "function"==typeof _resInterceptor?_resInterceptor.bind(this)(serverData,next):next()}},apiList);return api._before=function(apiOpts,apiConf,next){var signKeys=apiConf.signKeys,signData={},data=apiOpts.data;data||(data={}),data.app_key=appKey,Object.keys(data).forEach(function(item){-1<signKeys.indexOf(item)&&(data[item]||0===data[item])&&(signData[item]=data[item]);});try{data.sign=defaultSign(signData,[appCode]);}catch(e){console.error(e),data.sign="";}next(_objectSpread({},apiOpts,{data:data}));},api}

export default vsApi;
//# sourceMappingURL=cnfapi-mini-vs.esm.js.map
