!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n(require("cnfapi-miniprogram"),require("mksign")):"function"==typeof define&&define.amd?define(["cnfapi-miniprogram","mksign"],n):(e=e||self,function(){var t=e["cnfapi-mini-vs"],r=e["cnfapi-mini-vs"]=n(e.Api,e.mksign);r.noConflict=function(){return e["cnfapi-mini-vs"]=t,r}}())}(this,function(e,n){"use strict";e=e&&e.hasOwnProperty("default")?e.default:e;var t=function(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e};function r(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter(function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable})),t.push.apply(t,r)}return t}return function(){var i=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{apiList:{}},o=i.baseURL,c=void 0===o?"":o,a=i.env,f=void 0===a?"weapp":a,p=i.appKey,s=void 0===p?"":p,u=i.appCode,d=void 0===u?"":u,l=i.apiList,y=i.resInterceptor,b=i.openResInterceptor,g=i.resSuccessCallback,m=i.headers,v=new e({baseURL:c,env:f,timeout:1e4,headers:void 0===m?{"Content-Type":"application/json"}:m,resSuccessCallback:function(e,n){return g&&"function"==typeof g?g(e,n):200===e.retcode?n(null,e.data,e.retcode):n({msg:e.msg,retcode:e.retcode},{},e.retcode)},openResInterceptor:function(e){return"function"==typeof b&&b.call(this,e)},resInterceptor:function(e,n){return"function"==typeof y?y.bind(this)(e,n):n()}},l);return v._before=function(e,i,o){var c=i.signKeys,a={},f=e.data;f||(f={}),f.app_key=s,Object.keys(f).forEach(function(e){-1<c.indexOf(e)&&(f[e]||0===f[e])&&(a[e]=f[e])});try{f.sign=n.defaultSign(a,[d])}catch(e){console.error(e),f.sign=""}o(function(e){for(var n,i=1;i<arguments.length;i++)n=null==arguments[i]?{}:arguments[i],i%2?r(n,!0).forEach(function(r){t(e,r,n[r])}):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):r(n).forEach(function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))});return e}({},e,{data:f}))},v}});
//# sourceMappingURL=cnfapi-mini-vs.common.js.map
