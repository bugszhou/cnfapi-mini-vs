(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, (function () {
    var current = global['cnfapi-mini-vs'];
    var exports = global['cnfapi-mini-vs'] = factory();
    exports.noConflict = function () { global['cnfapi-mini-vs'] = current; return exports; };
  }()));
}(this, function () { 'use strict';

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

  var global$1 = (typeof global !== "undefined" ? global :
              typeof self !== "undefined" ? self :
              typeof window !== "undefined" ? window : {});

  // shim for using process in browser
  // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

  function defaultSetTimout() {
      throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout () {
      throw new Error('clearTimeout has not been defined');
  }
  var cachedSetTimeout = defaultSetTimout;
  var cachedClearTimeout = defaultClearTimeout;
  if (typeof global$1.setTimeout === 'function') {
      cachedSetTimeout = setTimeout;
  }
  if (typeof global$1.clearTimeout === 'function') {
      cachedClearTimeout = clearTimeout;
  }

  function runTimeout(fun) {
      if (cachedSetTimeout === setTimeout) {
          //normal enviroments in sane situations
          return setTimeout(fun, 0);
      }
      // if setTimeout wasn't available but was latter defined
      if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
          cachedSetTimeout = setTimeout;
          return setTimeout(fun, 0);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedSetTimeout(fun, 0);
      } catch(e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
              return cachedSetTimeout.call(null, fun, 0);
          } catch(e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
              return cachedSetTimeout.call(this, fun, 0);
          }
      }


  }
  function runClearTimeout(marker) {
      if (cachedClearTimeout === clearTimeout) {
          //normal enviroments in sane situations
          return clearTimeout(marker);
      }
      // if clearTimeout wasn't available but was latter defined
      if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
          cachedClearTimeout = clearTimeout;
          return clearTimeout(marker);
      }
      try {
          // when when somebody has screwed with setTimeout but no I.E. maddness
          return cachedClearTimeout(marker);
      } catch (e){
          try {
              // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
              return cachedClearTimeout.call(null, marker);
          } catch (e){
              // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
              // Some versions of I.E. have different rules for clearTimeout vs setTimeout
              return cachedClearTimeout.call(this, marker);
          }
      }



  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;

  function cleanUpNextTick() {
      if (!draining || !currentQueue) {
          return;
      }
      draining = false;
      if (currentQueue.length) {
          queue = currentQueue.concat(queue);
      } else {
          queueIndex = -1;
      }
      if (queue.length) {
          drainQueue();
      }
  }

  function drainQueue() {
      if (draining) {
          return;
      }
      var timeout = runTimeout(cleanUpNextTick);
      draining = true;

      var len = queue.length;
      while(len) {
          currentQueue = queue;
          queue = [];
          while (++queueIndex < len) {
              if (currentQueue) {
                  currentQueue[queueIndex].run();
              }
          }
          queueIndex = -1;
          len = queue.length;
      }
      currentQueue = null;
      draining = false;
      runClearTimeout(timeout);
  }
  function nextTick(fun) {
      var args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
          for (var i = 1; i < arguments.length; i++) {
              args[i - 1] = arguments[i];
          }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
          runTimeout(drainQueue);
      }
  }
  // v8 likes predictible objects
  function Item(fun, array) {
      this.fun = fun;
      this.array = array;
  }
  Item.prototype.run = function () {
      this.fun.apply(null, this.array);
  };
  var title = 'browser';
  var platform = 'browser';
  var browser = true;
  var env = {};
  var argv = [];
  var version = ''; // empty string to avoid regexp issues
  var versions = {};
  var release = {};
  var config = {};

  function noop() {}

  var on = noop;
  var addListener = noop;
  var once = noop;
  var off = noop;
  var removeListener = noop;
  var removeAllListeners = noop;
  var emit = noop;

  function binding(name) {
      throw new Error('process.binding is not supported');
  }

  function cwd () { return '/' }
  function chdir (dir) {
      throw new Error('process.chdir is not supported');
  }function umask() { return 0; }

  // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
  var performance = global$1.performance || {};
  var performanceNow =
    performance.now        ||
    performance.mozNow     ||
    performance.msNow      ||
    performance.oNow       ||
    performance.webkitNow  ||
    function(){ return (new Date()).getTime() };

  // generate timestamp or delta
  // see http://nodejs.org/api/process.html#process_process_hrtime
  function hrtime(previousTimestamp){
    var clocktime = performanceNow.call(performance)*1e-3;
    var seconds = Math.floor(clocktime);
    var nanoseconds = Math.floor((clocktime%1)*1e9);
    if (previousTimestamp) {
      seconds = seconds - previousTimestamp[0];
      nanoseconds = nanoseconds - previousTimestamp[1];
      if (nanoseconds<0) {
        seconds--;
        nanoseconds += 1e9;
      }
    }
    return [seconds,nanoseconds]
  }

  var startTime = new Date();
  function uptime() {
    var currentTime = new Date();
    var dif = currentTime - startTime;
    return dif / 1000;
  }

  var process = {
    nextTick: nextTick,
    title: title,
    browser: browser,
    env: env,
    argv: argv,
    version: version,
    versions: versions,
    on: on,
    addListener: addListener,
    once: once,
    off: off,
    removeListener: removeListener,
    removeAllListeners: removeAllListeners,
    emit: emit,
    binding: binding,
    cwd: cwd,
    chdir: chdir,
    umask: umask,
    hrtime: hrtime,
    platform: platform,
    release: release,
    config: config,
    uptime: uptime
  };

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var es5 = createCommonjsModule(function (module) {
  var isES5 = (function(){
      return this === undefined;
  })();

  if (isES5) {
      module.exports = {
          freeze: Object.freeze,
          defineProperty: Object.defineProperty,
          getDescriptor: Object.getOwnPropertyDescriptor,
          keys: Object.keys,
          names: Object.getOwnPropertyNames,
          getPrototypeOf: Object.getPrototypeOf,
          isArray: Array.isArray,
          isES5: isES5,
          propertyIsWritable: function(obj, prop) {
              var descriptor = Object.getOwnPropertyDescriptor(obj, prop);
              return !!(!descriptor || descriptor.writable || descriptor.set);
          }
      };
  } else {
      var has = {}.hasOwnProperty;
      var str = {}.toString;
      var proto = {}.constructor.prototype;

      var ObjectKeys = function (o) {
          var ret = [];
          for (var key in o) {
              if (has.call(o, key)) {
                  ret.push(key);
              }
          }
          return ret;
      };

      var ObjectGetDescriptor = function(o, key) {
          return {value: o[key]};
      };

      var ObjectDefineProperty = function (o, key, desc) {
          o[key] = desc.value;
          return o;
      };

      var ObjectFreeze = function (obj) {
          return obj;
      };

      var ObjectGetPrototypeOf = function (obj) {
          try {
              return Object(obj).constructor.prototype;
          }
          catch (e) {
              return proto;
          }
      };

      var ArrayIsArray = function (obj) {
          try {
              return str.call(obj) === "[object Array]";
          }
          catch(e) {
              return false;
          }
      };

      module.exports = {
          isArray: ArrayIsArray,
          keys: ObjectKeys,
          names: ObjectKeys,
          defineProperty: ObjectDefineProperty,
          getDescriptor: ObjectGetDescriptor,
          freeze: ObjectFreeze,
          getPrototypeOf: ObjectGetPrototypeOf,
          isES5: isES5,
          propertyIsWritable: function() {
              return true;
          }
      };
  }
  });
  var es5_1 = es5.freeze;
  var es5_2 = es5.defineProperty;
  var es5_3 = es5.getDescriptor;
  var es5_4 = es5.keys;
  var es5_5 = es5.names;
  var es5_6 = es5.getPrototypeOf;
  var es5_7 = es5.isArray;
  var es5_8 = es5.isES5;
  var es5_9 = es5.propertyIsWritable;

  var canEvaluate = typeof navigator == "undefined";

  var errorObj = {e: {}};
  var tryCatchTarget;
  var globalObject = typeof self !== "undefined" ? self :
      typeof window !== "undefined" ? window :
      typeof commonjsGlobal !== "undefined" ? commonjsGlobal :
      commonjsGlobal !== undefined ? commonjsGlobal : null;

  function tryCatcher() {
      try {
          var target = tryCatchTarget;
          tryCatchTarget = null;
          return target.apply(this, arguments);
      } catch (e) {
          errorObj.e = e;
          return errorObj;
      }
  }
  function tryCatch(fn) {
      tryCatchTarget = fn;
      return tryCatcher;
  }

  var inherits = function(Child, Parent) {
      var hasProp = {}.hasOwnProperty;

      function T() {
          this.constructor = Child;
          this.constructor$ = Parent;
          for (var propertyName in Parent.prototype) {
              if (hasProp.call(Parent.prototype, propertyName) &&
                  propertyName.charAt(propertyName.length-1) !== "$"
             ) {
                  this[propertyName + "$"] = Parent.prototype[propertyName];
              }
          }
      }
      T.prototype = Parent.prototype;
      Child.prototype = new T();
      return Child.prototype;
  };


  function isPrimitive(val) {
      return val == null || val === true || val === false ||
          typeof val === "string" || typeof val === "number";

  }

  function isObject(value) {
      return typeof value === "function" ||
             typeof value === "object" && value !== null;
  }

  function maybeWrapAsError(maybeError) {
      if (!isPrimitive(maybeError)) return maybeError;

      return new Error(safeToString(maybeError));
  }

  function withAppended(target, appendee) {
      var len = target.length;
      var ret = new Array(len + 1);
      var i;
      for (i = 0; i < len; ++i) {
          ret[i] = target[i];
      }
      ret[i] = appendee;
      return ret;
  }

  function getDataPropertyOrDefault(obj, key, defaultValue) {
      if (es5.isES5) {
          var desc = Object.getOwnPropertyDescriptor(obj, key);

          if (desc != null) {
              return desc.get == null && desc.set == null
                      ? desc.value
                      : defaultValue;
          }
      } else {
          return {}.hasOwnProperty.call(obj, key) ? obj[key] : undefined;
      }
  }

  function notEnumerableProp(obj, name, value) {
      if (isPrimitive(obj)) return obj;
      var descriptor = {
          value: value,
          configurable: true,
          enumerable: false,
          writable: true
      };
      es5.defineProperty(obj, name, descriptor);
      return obj;
  }

  function thrower(r) {
      throw r;
  }

  var inheritedDataKeys = (function() {
      var excludedPrototypes = [
          Array.prototype,
          Object.prototype,
          Function.prototype
      ];

      var isExcludedProto = function(val) {
          for (var i = 0; i < excludedPrototypes.length; ++i) {
              if (excludedPrototypes[i] === val) {
                  return true;
              }
          }
          return false;
      };

      if (es5.isES5) {
          var getKeys = Object.getOwnPropertyNames;
          return function(obj) {
              var ret = [];
              var visitedKeys = Object.create(null);
              while (obj != null && !isExcludedProto(obj)) {
                  var keys;
                  try {
                      keys = getKeys(obj);
                  } catch (e) {
                      return ret;
                  }
                  for (var i = 0; i < keys.length; ++i) {
                      var key = keys[i];
                      if (visitedKeys[key]) continue;
                      visitedKeys[key] = true;
                      var desc = Object.getOwnPropertyDescriptor(obj, key);
                      if (desc != null && desc.get == null && desc.set == null) {
                          ret.push(key);
                      }
                  }
                  obj = es5.getPrototypeOf(obj);
              }
              return ret;
          };
      } else {
          var hasProp = {}.hasOwnProperty;
          return function(obj) {
              if (isExcludedProto(obj)) return [];
              var ret = [];

              /*jshint forin:false */
              enumeration: for (var key in obj) {
                  if (hasProp.call(obj, key)) {
                      ret.push(key);
                  } else {
                      for (var i = 0; i < excludedPrototypes.length; ++i) {
                          if (hasProp.call(excludedPrototypes[i], key)) {
                              continue enumeration;
                          }
                      }
                      ret.push(key);
                  }
              }
              return ret;
          };
      }

  })();

  var thisAssignmentPattern = /this\s*\.\s*\S+\s*=/;
  function isClass(fn) {
      try {
          if (typeof fn === "function") {
              var keys = es5.names(fn.prototype);

              var hasMethods = es5.isES5 && keys.length > 1;
              var hasMethodsOtherThanConstructor = keys.length > 0 &&
                  !(keys.length === 1 && keys[0] === "constructor");
              var hasThisAssignmentAndStaticMethods =
                  thisAssignmentPattern.test(fn + "") && es5.names(fn).length > 0;

              if (hasMethods || hasMethodsOtherThanConstructor ||
                  hasThisAssignmentAndStaticMethods) {
                  return true;
              }
          }
          return false;
      } catch (e) {
          return false;
      }
  }

  function toFastProperties(obj) {
      return obj;
      eval(obj);
  }

  var rident = /^[a-z$_][a-z$_0-9]*$/i;
  function isIdentifier(str) {
      return rident.test(str);
  }

  function filledRange(count, prefix, suffix) {
      var ret = new Array(count);
      for(var i = 0; i < count; ++i) {
          ret[i] = prefix + i + suffix;
      }
      return ret;
  }

  function safeToString(obj) {
      try {
          return obj + "";
      } catch (e) {
          return "[no string representation]";
      }
  }

  function isError(obj) {
      return obj instanceof Error ||
          (obj !== null &&
             typeof obj === "object" &&
             typeof obj.message === "string" &&
             typeof obj.name === "string");
  }

  function markAsOriginatingFromRejection(e) {
      try {
          notEnumerableProp(e, "isOperational", true);
      }
      catch(ignore) {}
  }

  function originatesFromRejection(e) {
      if (e == null) return false;
      return ((e instanceof Error["__BluebirdErrorTypes__"].OperationalError) ||
          e["isOperational"] === true);
  }

  function canAttachTrace(obj) {
      return isError(obj) && es5.propertyIsWritable(obj, "stack");
  }

  var ensureErrorObject = (function() {
      if (!("stack" in new Error())) {
          return function(value) {
              if (canAttachTrace(value)) return value;
              try {throw new Error(safeToString(value));}
              catch(err) {return err;}
          };
      } else {
          return function(value) {
              if (canAttachTrace(value)) return value;
              return new Error(safeToString(value));
          };
      }
  })();

  function classString(obj) {
      return {}.toString.call(obj);
  }

  function copyDescriptors(from, to, filter) {
      var keys = es5.names(from);
      for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          if (filter(key)) {
              try {
                  es5.defineProperty(to, key, es5.getDescriptor(from, key));
              } catch (ignore) {}
          }
      }
  }

  var asArray = function(v) {
      if (es5.isArray(v)) {
          return v;
      }
      return null;
  };

  if (typeof Symbol !== "undefined" && Symbol.iterator) {
      var ArrayFrom = typeof Array.from === "function" ? function(v) {
          return Array.from(v);
      } : function(v) {
          var ret = [];
          var it = v[Symbol.iterator]();
          var itResult;
          while (!((itResult = it.next()).done)) {
              ret.push(itResult.value);
          }
          return ret;
      };

      asArray = function(v) {
          if (es5.isArray(v)) {
              return v;
          } else if (v != null && typeof v[Symbol.iterator] === "function") {
              return ArrayFrom(v);
          }
          return null;
      };
  }

  var isNode = typeof process !== "undefined" &&
          classString(process).toLowerCase() === "[object process]";

  var hasEnvVariables = typeof process !== "undefined" &&
      typeof process.env !== "undefined";

  function env$1(key) {
      return hasEnvVariables ? process.env[key] : undefined;
  }

  function getNativePromise() {
      if (typeof Promise === "function") {
          try {
              var promise = new Promise(function(){});
              if ({}.toString.call(promise) === "[object Promise]") {
                  return Promise;
              }
          } catch (e) {}
      }
  }

  function domainBind(self, cb) {
      return self.bind(cb);
  }

  var ret = {
      isClass: isClass,
      isIdentifier: isIdentifier,
      inheritedDataKeys: inheritedDataKeys,
      getDataPropertyOrDefault: getDataPropertyOrDefault,
      thrower: thrower,
      isArray: es5.isArray,
      asArray: asArray,
      notEnumerableProp: notEnumerableProp,
      isPrimitive: isPrimitive,
      isObject: isObject,
      isError: isError,
      canEvaluate: canEvaluate,
      errorObj: errorObj,
      tryCatch: tryCatch,
      inherits: inherits,
      withAppended: withAppended,
      maybeWrapAsError: maybeWrapAsError,
      toFastProperties: toFastProperties,
      filledRange: filledRange,
      toString: safeToString,
      canAttachTrace: canAttachTrace,
      ensureErrorObject: ensureErrorObject,
      originatesFromRejection: originatesFromRejection,
      markAsOriginatingFromRejection: markAsOriginatingFromRejection,
      classString: classString,
      copyDescriptors: copyDescriptors,
      hasDevTools: typeof chrome !== "undefined" && chrome &&
                   typeof chrome.loadTimes === "function",
      isNode: isNode,
      hasEnvVariables: hasEnvVariables,
      env: env$1,
      global: globalObject,
      getNativePromise: getNativePromise,
      domainBind: domainBind
  };
  ret.isRecentNode = ret.isNode && (function() {
      var version;
      if (process.versions && process.versions.node) {    
          version = process.versions.node.split(".").map(Number);
      } else if (process.version) {
          version = process.version.split(".").map(Number);
      }
      return (version[0] === 0 && version[1] > 10) || (version[0] > 0);
  })();

  if (ret.isNode) ret.toFastProperties(process);

  try {throw new Error(); } catch (e) {ret.lastLineError = e;}
  var util = ret;

  var schedule;
  var noAsyncScheduler = function() {
      throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
  };
  var NativePromise = util.getNativePromise();
  if (util.isNode && typeof MutationObserver === "undefined") {
      var GlobalSetImmediate = commonjsGlobal.setImmediate;
      var ProcessNextTick = nextTick;
      schedule = util.isRecentNode
                  ? function(fn) { GlobalSetImmediate.call(commonjsGlobal, fn); }
                  : function(fn) { ProcessNextTick.call(process, fn); };
  } else if (typeof NativePromise === "function" &&
             typeof NativePromise.resolve === "function") {
      var nativePromise = NativePromise.resolve();
      schedule = function(fn) {
          nativePromise.then(fn);
      };
  } else if ((typeof MutationObserver !== "undefined") &&
            !(typeof window !== "undefined" &&
              window.navigator &&
              (window.navigator.standalone || window.cordova)) &&
            ("classList" in document.documentElement)) {
      schedule = (function() {
          var div = document.createElement("div");
          var opts = {attributes: true};
          var toggleScheduled = false;
          var div2 = document.createElement("div");
          var o2 = new MutationObserver(function() {
              div.classList.toggle("foo");
              toggleScheduled = false;
          });
          o2.observe(div2, opts);

          var scheduleToggle = function() {
              if (toggleScheduled) return;
              toggleScheduled = true;
              div2.classList.toggle("foo");
          };

          return function schedule(fn) {
              var o = new MutationObserver(function() {
                  o.disconnect();
                  fn();
              });
              o.observe(div, opts);
              scheduleToggle();
          };
      })();
  } else if (typeof setImmediate !== "undefined") {
      schedule = function (fn) {
          setImmediate(fn);
      };
  } else if (typeof setTimeout !== "undefined") {
      schedule = function (fn) {
          setTimeout(fn, 0);
      };
  } else {
      schedule = noAsyncScheduler;
  }
  var schedule_1 = schedule;

  function arrayMove(src, srcIndex, dst, dstIndex, len) {
      for (var j = 0; j < len; ++j) {
          dst[j + dstIndex] = src[j + srcIndex];
          src[j + srcIndex] = void 0;
      }
  }

  function Queue(capacity) {
      this._capacity = capacity;
      this._length = 0;
      this._front = 0;
  }

  Queue.prototype._willBeOverCapacity = function (size) {
      return this._capacity < size;
  };

  Queue.prototype._pushOne = function (arg) {
      var length = this.length();
      this._checkCapacity(length + 1);
      var i = (this._front + length) & (this._capacity - 1);
      this[i] = arg;
      this._length = length + 1;
  };

  Queue.prototype.push = function (fn, receiver, arg) {
      var length = this.length() + 3;
      if (this._willBeOverCapacity(length)) {
          this._pushOne(fn);
          this._pushOne(receiver);
          this._pushOne(arg);
          return;
      }
      var j = this._front + length - 3;
      this._checkCapacity(length);
      var wrapMask = this._capacity - 1;
      this[(j + 0) & wrapMask] = fn;
      this[(j + 1) & wrapMask] = receiver;
      this[(j + 2) & wrapMask] = arg;
      this._length = length;
  };

  Queue.prototype.shift = function () {
      var front = this._front,
          ret = this[front];

      this[front] = undefined;
      this._front = (front + 1) & (this._capacity - 1);
      this._length--;
      return ret;
  };

  Queue.prototype.length = function () {
      return this._length;
  };

  Queue.prototype._checkCapacity = function (size) {
      if (this._capacity < size) {
          this._resizeTo(this._capacity << 1);
      }
  };

  Queue.prototype._resizeTo = function (capacity) {
      var oldCapacity = this._capacity;
      this._capacity = capacity;
      var front = this._front;
      var length = this._length;
      var moveItemsCount = (front + length) & (oldCapacity - 1);
      arrayMove(this, 0, this, oldCapacity, moveItemsCount);
  };

  var queue$1 = Queue;

  var firstLineError;
  try {throw new Error(); } catch (e) {firstLineError = e;}




  function Async() {
      this._customScheduler = false;
      this._isTickUsed = false;
      this._lateQueue = new queue$1(16);
      this._normalQueue = new queue$1(16);
      this._haveDrainedQueues = false;
      this._trampolineEnabled = true;
      var self = this;
      this.drainQueues = function () {
          self._drainQueues();
      };
      this._schedule = schedule_1;
  }

  Async.prototype.setScheduler = function(fn) {
      var prev = this._schedule;
      this._schedule = fn;
      this._customScheduler = true;
      return prev;
  };

  Async.prototype.hasCustomScheduler = function() {
      return this._customScheduler;
  };

  Async.prototype.enableTrampoline = function() {
      this._trampolineEnabled = true;
  };

  Async.prototype.disableTrampolineIfNecessary = function() {
      if (util.hasDevTools) {
          this._trampolineEnabled = false;
      }
  };

  Async.prototype.haveItemsQueued = function () {
      return this._isTickUsed || this._haveDrainedQueues;
  };


  Async.prototype.fatalError = function(e, isNode) {
      if (isNode) {
          process.stderr.write("Fatal " + (e instanceof Error ? e.stack : e) +
              "\n");
          process.exit(2);
      } else {
          this.throwLater(e);
      }
  };

  Async.prototype.throwLater = function(fn, arg) {
      if (arguments.length === 1) {
          arg = fn;
          fn = function () { throw arg; };
      }
      if (typeof setTimeout !== "undefined") {
          setTimeout(function() {
              fn(arg);
          }, 0);
      } else try {
          this._schedule(function() {
              fn(arg);
          });
      } catch (e) {
          throw new Error("No async scheduler available\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
  };

  function AsyncInvokeLater(fn, receiver, arg) {
      this._lateQueue.push(fn, receiver, arg);
      this._queueTick();
  }

  function AsyncInvoke(fn, receiver, arg) {
      this._normalQueue.push(fn, receiver, arg);
      this._queueTick();
  }

  function AsyncSettlePromises(promise) {
      this._normalQueue._pushOne(promise);
      this._queueTick();
  }

  if (!util.hasDevTools) {
      Async.prototype.invokeLater = AsyncInvokeLater;
      Async.prototype.invoke = AsyncInvoke;
      Async.prototype.settlePromises = AsyncSettlePromises;
  } else {
      Async.prototype.invokeLater = function (fn, receiver, arg) {
          if (this._trampolineEnabled) {
              AsyncInvokeLater.call(this, fn, receiver, arg);
          } else {
              this._schedule(function() {
                  setTimeout(function() {
                      fn.call(receiver, arg);
                  }, 100);
              });
          }
      };

      Async.prototype.invoke = function (fn, receiver, arg) {
          if (this._trampolineEnabled) {
              AsyncInvoke.call(this, fn, receiver, arg);
          } else {
              this._schedule(function() {
                  fn.call(receiver, arg);
              });
          }
      };

      Async.prototype.settlePromises = function(promise) {
          if (this._trampolineEnabled) {
              AsyncSettlePromises.call(this, promise);
          } else {
              this._schedule(function() {
                  promise._settlePromises();
              });
          }
      };
  }

  function _drainQueue(queue) {
      while (queue.length() > 0) {
          _drainQueueStep(queue);
      }
  }

  function _drainQueueStep(queue) {
      var fn = queue.shift();
      if (typeof fn !== "function") {
          fn._settlePromises();
      } else {
          var receiver = queue.shift();
          var arg = queue.shift();
          fn.call(receiver, arg);
      }
  }

  Async.prototype._drainQueues = function () {
      _drainQueue(this._normalQueue);
      this._reset();
      this._haveDrainedQueues = true;
      _drainQueue(this._lateQueue);
  };

  Async.prototype._queueTick = function () {
      if (!this._isTickUsed) {
          this._isTickUsed = true;
          this._schedule(this.drainQueues);
      }
  };

  Async.prototype._reset = function () {
      this._isTickUsed = false;
  };

  var async = Async;
  var firstLineError_1 = firstLineError;
  async.firstLineError = firstLineError_1;

  var Objectfreeze = es5.freeze;

  var inherits$1 = util.inherits;
  var notEnumerableProp$1 = util.notEnumerableProp;

  function subError(nameProperty, defaultMessage) {
      function SubError(message) {
          if (!(this instanceof SubError)) return new SubError(message);
          notEnumerableProp$1(this, "message",
              typeof message === "string" ? message : defaultMessage);
          notEnumerableProp$1(this, "name", nameProperty);
          if (Error.captureStackTrace) {
              Error.captureStackTrace(this, this.constructor);
          } else {
              Error.call(this);
          }
      }
      inherits$1(SubError, Error);
      return SubError;
  }

  var _TypeError, _RangeError;
  var Warning = subError("Warning", "warning");
  var CancellationError = subError("CancellationError", "cancellation error");
  var TimeoutError = subError("TimeoutError", "timeout error");
  var AggregateError = subError("AggregateError", "aggregate error");
  try {
      _TypeError = TypeError;
      _RangeError = RangeError;
  } catch(e) {
      _TypeError = subError("TypeError", "type error");
      _RangeError = subError("RangeError", "range error");
  }

  var methods = ("join pop push shift unshift slice filter forEach some " +
      "every map indexOf lastIndexOf reduce reduceRight sort reverse").split(" ");

  for (var i = 0; i < methods.length; ++i) {
      if (typeof Array.prototype[methods[i]] === "function") {
          AggregateError.prototype[methods[i]] = Array.prototype[methods[i]];
      }
  }

  es5.defineProperty(AggregateError.prototype, "length", {
      value: 0,
      configurable: false,
      writable: true,
      enumerable: true
  });
  AggregateError.prototype["isOperational"] = true;
  var level = 0;
  AggregateError.prototype.toString = function() {
      var indent = Array(level * 4 + 1).join(" ");
      var ret = "\n" + indent + "AggregateError of:" + "\n";
      level++;
      indent = Array(level * 4 + 1).join(" ");
      for (var i = 0; i < this.length; ++i) {
          var str = this[i] === this ? "[Circular AggregateError]" : this[i] + "";
          var lines = str.split("\n");
          for (var j = 0; j < lines.length; ++j) {
              lines[j] = indent + lines[j];
          }
          str = lines.join("\n");
          ret += str + "\n";
      }
      level--;
      return ret;
  };

  function OperationalError(message) {
      if (!(this instanceof OperationalError))
          return new OperationalError(message);
      notEnumerableProp$1(this, "name", "OperationalError");
      notEnumerableProp$1(this, "message", message);
      this.cause = message;
      this["isOperational"] = true;

      if (message instanceof Error) {
          notEnumerableProp$1(this, "message", message.message);
          notEnumerableProp$1(this, "stack", message.stack);
      } else if (Error.captureStackTrace) {
          Error.captureStackTrace(this, this.constructor);
      }

  }
  inherits$1(OperationalError, Error);

  var errorTypes = Error["__BluebirdErrorTypes__"];
  if (!errorTypes) {
      errorTypes = Objectfreeze({
          CancellationError: CancellationError,
          TimeoutError: TimeoutError,
          OperationalError: OperationalError,
          RejectionError: OperationalError,
          AggregateError: AggregateError
      });
      es5.defineProperty(Error, "__BluebirdErrorTypes__", {
          value: errorTypes,
          writable: false,
          enumerable: false,
          configurable: false
      });
  }

  var errors = {
      Error: Error,
      TypeError: _TypeError,
      RangeError: _RangeError,
      CancellationError: errorTypes.CancellationError,
      OperationalError: errorTypes.OperationalError,
      TimeoutError: errorTypes.TimeoutError,
      AggregateError: errorTypes.AggregateError,
      Warning: Warning
  };

  var thenables = function(Promise, INTERNAL) {
  var util$1 = util;
  var errorObj = util$1.errorObj;
  var isObject = util$1.isObject;

  function tryConvertToPromise(obj, context) {
      if (isObject(obj)) {
          if (obj instanceof Promise) return obj;
          var then = getThen(obj);
          if (then === errorObj) {
              if (context) context._pushContext();
              var ret = Promise.reject(then.e);
              if (context) context._popContext();
              return ret;
          } else if (typeof then === "function") {
              if (isAnyBluebirdPromise(obj)) {
                  var ret = new Promise(INTERNAL);
                  obj._then(
                      ret._fulfill,
                      ret._reject,
                      undefined,
                      ret,
                      null
                  );
                  return ret;
              }
              return doThenable(obj, then, context);
          }
      }
      return obj;
  }

  function doGetThen(obj) {
      return obj.then;
  }

  function getThen(obj) {
      try {
          return doGetThen(obj);
      } catch (e) {
          errorObj.e = e;
          return errorObj;
      }
  }

  var hasProp = {}.hasOwnProperty;
  function isAnyBluebirdPromise(obj) {
      try {
          return hasProp.call(obj, "_promise0");
      } catch (e) {
          return false;
      }
  }

  function doThenable(x, then, context) {
      var promise = new Promise(INTERNAL);
      var ret = promise;
      if (context) context._pushContext();
      promise._captureStackTrace();
      if (context) context._popContext();
      var synchronous = true;
      var result = util$1.tryCatch(then).call(x, resolve, reject);
      synchronous = false;

      if (promise && result === errorObj) {
          promise._rejectCallback(result.e, true, true);
          promise = null;
      }

      function resolve(value) {
          if (!promise) return;
          promise._resolveCallback(value);
          promise = null;
      }

      function reject(reason) {
          if (!promise) return;
          promise._rejectCallback(reason, synchronous, true);
          promise = null;
      }
      return ret;
  }

  return tryConvertToPromise;
  };

  var promise_array = function(Promise, INTERNAL, tryConvertToPromise,
      apiRejection, Proxyable) {
  var util$1 = util;

  function toResolutionValue(val) {
      switch(val) {
      case -2: return [];
      case -3: return {};
      case -6: return new Map();
      }
  }

  function PromiseArray(values) {
      var promise = this._promise = new Promise(INTERNAL);
      if (values instanceof Promise) {
          promise._propagateFrom(values, 3);
      }
      promise._setOnCancel(this);
      this._values = values;
      this._length = 0;
      this._totalResolved = 0;
      this._init(undefined, -2);
  }
  util$1.inherits(PromiseArray, Proxyable);

  PromiseArray.prototype.length = function () {
      return this._length;
  };

  PromiseArray.prototype.promise = function () {
      return this._promise;
  };

  PromiseArray.prototype._init = function init(_, resolveValueIfEmpty) {
      var values = tryConvertToPromise(this._values, this._promise);
      if (values instanceof Promise) {
          values = values._target();
          var bitField = values._bitField;
          this._values = values;

          if (((bitField & 50397184) === 0)) {
              this._promise._setAsyncGuaranteed();
              return values._then(
                  init,
                  this._reject,
                  undefined,
                  this,
                  resolveValueIfEmpty
             );
          } else if (((bitField & 33554432) !== 0)) {
              values = values._value();
          } else if (((bitField & 16777216) !== 0)) {
              return this._reject(values._reason());
          } else {
              return this._cancel();
          }
      }
      values = util$1.asArray(values);
      if (values === null) {
          var err = apiRejection(
              "expecting an array or an iterable object but got " + util$1.classString(values)).reason();
          this._promise._rejectCallback(err, false);
          return;
      }

      if (values.length === 0) {
          if (resolveValueIfEmpty === -5) {
              this._resolveEmptyArray();
          }
          else {
              this._resolve(toResolutionValue(resolveValueIfEmpty));
          }
          return;
      }
      this._iterate(values);
  };

  PromiseArray.prototype._iterate = function(values) {
      var len = this.getActualLength(values.length);
      this._length = len;
      this._values = this.shouldCopyValues() ? new Array(len) : this._values;
      var result = this._promise;
      var isResolved = false;
      var bitField = null;
      for (var i = 0; i < len; ++i) {
          var maybePromise = tryConvertToPromise(values[i], result);

          if (maybePromise instanceof Promise) {
              maybePromise = maybePromise._target();
              bitField = maybePromise._bitField;
          } else {
              bitField = null;
          }

          if (isResolved) {
              if (bitField !== null) {
                  maybePromise.suppressUnhandledRejections();
              }
          } else if (bitField !== null) {
              if (((bitField & 50397184) === 0)) {
                  maybePromise._proxy(this, i);
                  this._values[i] = maybePromise;
              } else if (((bitField & 33554432) !== 0)) {
                  isResolved = this._promiseFulfilled(maybePromise._value(), i);
              } else if (((bitField & 16777216) !== 0)) {
                  isResolved = this._promiseRejected(maybePromise._reason(), i);
              } else {
                  isResolved = this._promiseCancelled(i);
              }
          } else {
              isResolved = this._promiseFulfilled(maybePromise, i);
          }
      }
      if (!isResolved) result._setAsyncGuaranteed();
  };

  PromiseArray.prototype._isResolved = function () {
      return this._values === null;
  };

  PromiseArray.prototype._resolve = function (value) {
      this._values = null;
      this._promise._fulfill(value);
  };

  PromiseArray.prototype._cancel = function() {
      if (this._isResolved() || !this._promise._isCancellable()) return;
      this._values = null;
      this._promise._cancel();
  };

  PromiseArray.prototype._reject = function (reason) {
      this._values = null;
      this._promise._rejectCallback(reason, false);
  };

  PromiseArray.prototype._promiseFulfilled = function (value, index) {
      this._values[index] = value;
      var totalResolved = ++this._totalResolved;
      if (totalResolved >= this._length) {
          this._resolve(this._values);
          return true;
      }
      return false;
  };

  PromiseArray.prototype._promiseCancelled = function() {
      this._cancel();
      return true;
  };

  PromiseArray.prototype._promiseRejected = function (reason) {
      this._totalResolved++;
      this._reject(reason);
      return true;
  };

  PromiseArray.prototype._resultCancelled = function() {
      if (this._isResolved()) return;
      var values = this._values;
      this._cancel();
      if (values instanceof Promise) {
          values.cancel();
      } else {
          for (var i = 0; i < values.length; ++i) {
              if (values[i] instanceof Promise) {
                  values[i].cancel();
              }
          }
      }
  };

  PromiseArray.prototype.shouldCopyValues = function () {
      return true;
  };

  PromiseArray.prototype.getActualLength = function (len) {
      return len;
  };

  return PromiseArray;
  };

  var context = function(Promise) {
  var longStackTraces = false;
  var contextStack = [];

  Promise.prototype._promiseCreated = function() {};
  Promise.prototype._pushContext = function() {};
  Promise.prototype._popContext = function() {return null;};
  Promise._peekContext = Promise.prototype._peekContext = function() {};

  function Context() {
      this._trace = new Context.CapturedTrace(peekContext());
  }
  Context.prototype._pushContext = function () {
      if (this._trace !== undefined) {
          this._trace._promiseCreated = null;
          contextStack.push(this._trace);
      }
  };

  Context.prototype._popContext = function () {
      if (this._trace !== undefined) {
          var trace = contextStack.pop();
          var ret = trace._promiseCreated;
          trace._promiseCreated = null;
          return ret;
      }
      return null;
  };

  function createContext() {
      if (longStackTraces) return new Context();
  }

  function peekContext() {
      var lastIndex = contextStack.length - 1;
      if (lastIndex >= 0) {
          return contextStack[lastIndex];
      }
      return undefined;
  }
  Context.CapturedTrace = null;
  Context.create = createContext;
  Context.deactivateLongStackTraces = function() {};
  Context.activateLongStackTraces = function() {
      var Promise_pushContext = Promise.prototype._pushContext;
      var Promise_popContext = Promise.prototype._popContext;
      var Promise_PeekContext = Promise._peekContext;
      var Promise_peekContext = Promise.prototype._peekContext;
      var Promise_promiseCreated = Promise.prototype._promiseCreated;
      Context.deactivateLongStackTraces = function() {
          Promise.prototype._pushContext = Promise_pushContext;
          Promise.prototype._popContext = Promise_popContext;
          Promise._peekContext = Promise_PeekContext;
          Promise.prototype._peekContext = Promise_peekContext;
          Promise.prototype._promiseCreated = Promise_promiseCreated;
          longStackTraces = false;
      };
      longStackTraces = true;
      Promise.prototype._pushContext = Context.prototype._pushContext;
      Promise.prototype._popContext = Context.prototype._popContext;
      Promise._peekContext = Promise.prototype._peekContext = peekContext;
      Promise.prototype._promiseCreated = function() {
          var ctx = this._peekContext();
          if (ctx && ctx._promiseCreated == null) ctx._promiseCreated = this;
      };
  };
  return Context;
  };

  var debuggability = function(Promise, Context) {
  var getDomain = Promise._getDomain;
  var async = Promise._async;
  var Warning = errors.Warning;
  var util$1 = util;
  var es5$1 = es5;
  var canAttachTrace = util$1.canAttachTrace;
  var unhandledRejectionHandled;
  var possiblyUnhandledRejection;
  var bluebirdFramePattern =
      /[\\\/]bluebird[\\\/]js[\\\/](release|debug|instrumented)/;
  var nodeFramePattern = /\((?:timers\.js):\d+:\d+\)/;
  var parseLinePattern = /[\/<\(](.+?):(\d+):(\d+)\)?\s*$/;
  var stackFramePattern = null;
  var formatStack = null;
  var indentStackFrames = false;
  var printWarning;
  var debugging = !!(util$1.env("BLUEBIRD_DEBUG") != 0 &&
                          (
                           util$1.env("BLUEBIRD_DEBUG") ||
                           util$1.env("NODE_ENV") === "development"));

  var warnings = !!(util$1.env("BLUEBIRD_WARNINGS") != 0 &&
      (debugging || util$1.env("BLUEBIRD_WARNINGS")));

  var longStackTraces = !!(util$1.env("BLUEBIRD_LONG_STACK_TRACES") != 0 &&
      (debugging || util$1.env("BLUEBIRD_LONG_STACK_TRACES")));

  var wForgottenReturn = util$1.env("BLUEBIRD_W_FORGOTTEN_RETURN") != 0 &&
      (warnings || !!util$1.env("BLUEBIRD_W_FORGOTTEN_RETURN"));

  Promise.prototype.suppressUnhandledRejections = function() {
      var target = this._target();
      target._bitField = ((target._bitField & (~1048576)) |
                        524288);
  };

  Promise.prototype._ensurePossibleRejectionHandled = function () {
      if ((this._bitField & 524288) !== 0) return;
      this._setRejectionIsUnhandled();
      var self = this;
      setTimeout(function() {
          self._notifyUnhandledRejection();
      }, 1);
  };

  Promise.prototype._notifyUnhandledRejectionIsHandled = function () {
      fireRejectionEvent("rejectionHandled",
                                    unhandledRejectionHandled, undefined, this);
  };

  Promise.prototype._setReturnedNonUndefined = function() {
      this._bitField = this._bitField | 268435456;
  };

  Promise.prototype._returnedNonUndefined = function() {
      return (this._bitField & 268435456) !== 0;
  };

  Promise.prototype._notifyUnhandledRejection = function () {
      if (this._isRejectionUnhandled()) {
          var reason = this._settledValue();
          this._setUnhandledRejectionIsNotified();
          fireRejectionEvent("unhandledRejection",
                                        possiblyUnhandledRejection, reason, this);
      }
  };

  Promise.prototype._setUnhandledRejectionIsNotified = function () {
      this._bitField = this._bitField | 262144;
  };

  Promise.prototype._unsetUnhandledRejectionIsNotified = function () {
      this._bitField = this._bitField & (~262144);
  };

  Promise.prototype._isUnhandledRejectionNotified = function () {
      return (this._bitField & 262144) > 0;
  };

  Promise.prototype._setRejectionIsUnhandled = function () {
      this._bitField = this._bitField | 1048576;
  };

  Promise.prototype._unsetRejectionIsUnhandled = function () {
      this._bitField = this._bitField & (~1048576);
      if (this._isUnhandledRejectionNotified()) {
          this._unsetUnhandledRejectionIsNotified();
          this._notifyUnhandledRejectionIsHandled();
      }
  };

  Promise.prototype._isRejectionUnhandled = function () {
      return (this._bitField & 1048576) > 0;
  };

  Promise.prototype._warn = function(message, shouldUseOwnTrace, promise) {
      return warn(message, shouldUseOwnTrace, promise || this);
  };

  Promise.onPossiblyUnhandledRejection = function (fn) {
      var domain = getDomain();
      possiblyUnhandledRejection =
          typeof fn === "function" ? (domain === null ?
                                              fn : util$1.domainBind(domain, fn))
                                   : undefined;
  };

  Promise.onUnhandledRejectionHandled = function (fn) {
      var domain = getDomain();
      unhandledRejectionHandled =
          typeof fn === "function" ? (domain === null ?
                                              fn : util$1.domainBind(domain, fn))
                                   : undefined;
  };

  var disableLongStackTraces = function() {};
  Promise.longStackTraces = function () {
      if (async.haveItemsQueued() && !config.longStackTraces) {
          throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      if (!config.longStackTraces && longStackTracesIsSupported()) {
          var Promise_captureStackTrace = Promise.prototype._captureStackTrace;
          var Promise_attachExtraTrace = Promise.prototype._attachExtraTrace;
          var Promise_dereferenceTrace = Promise.prototype._dereferenceTrace;
          config.longStackTraces = true;
          disableLongStackTraces = function() {
              if (async.haveItemsQueued() && !config.longStackTraces) {
                  throw new Error("cannot enable long stack traces after promises have been created\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
              }
              Promise.prototype._captureStackTrace = Promise_captureStackTrace;
              Promise.prototype._attachExtraTrace = Promise_attachExtraTrace;
              Promise.prototype._dereferenceTrace = Promise_dereferenceTrace;
              Context.deactivateLongStackTraces();
              async.enableTrampoline();
              config.longStackTraces = false;
          };
          Promise.prototype._captureStackTrace = longStackTracesCaptureStackTrace;
          Promise.prototype._attachExtraTrace = longStackTracesAttachExtraTrace;
          Promise.prototype._dereferenceTrace = longStackTracesDereferenceTrace;
          Context.activateLongStackTraces();
          async.disableTrampolineIfNecessary();
      }
  };

  Promise.hasLongStackTraces = function () {
      return config.longStackTraces && longStackTracesIsSupported();
  };

  var fireDomEvent = (function() {
      try {
          if (typeof CustomEvent === "function") {
              var event = new CustomEvent("CustomEvent");
              util$1.global.dispatchEvent(event);
              return function(name, event) {
                  var eventData = {
                      detail: event,
                      cancelable: true
                  };
                  es5$1.defineProperty(
                      eventData, "promise", {value: event.promise});
                  es5$1.defineProperty(eventData, "reason", {value: event.reason});
                  var domEvent = new CustomEvent(name.toLowerCase(), eventData);
                  return !util$1.global.dispatchEvent(domEvent);
              };
          } else if (typeof Event === "function") {
              var event = new Event("CustomEvent");
              util$1.global.dispatchEvent(event);
              return function(name, event) {
                  var domEvent = new Event(name.toLowerCase(), {
                      cancelable: true
                  });
                  domEvent.detail = event;
                  es5$1.defineProperty(domEvent, "promise", {value: event.promise});
                  es5$1.defineProperty(domEvent, "reason", {value: event.reason});
                  return !util$1.global.dispatchEvent(domEvent);
              };
          } else {
              var event = document.createEvent("CustomEvent");
              event.initCustomEvent("testingtheevent", false, true, {});
              util$1.global.dispatchEvent(event);
              return function(name, event) {
                  var domEvent = document.createEvent("CustomEvent");
                  domEvent.initCustomEvent(name.toLowerCase(), false, true,
                      event);
                  return !util$1.global.dispatchEvent(domEvent);
              };
          }
      } catch (e) {}
      return function() {
          return false;
      };
  })();

  var fireGlobalEvent = (function() {
      if (util$1.isNode) {
          return function() {
              return process.emit.apply(process, arguments);
          };
      } else {
          if (!util$1.global) {
              return function() {
                  return false;
              };
          }
          return function(name) {
              var methodName = "on" + name.toLowerCase();
              var method = util$1.global[methodName];
              if (!method) return false;
              method.apply(util$1.global, [].slice.call(arguments, 1));
              return true;
          };
      }
  })();

  function generatePromiseLifecycleEventObject(name, promise) {
      return {promise: promise};
  }

  var eventToObjectGenerator = {
      promiseCreated: generatePromiseLifecycleEventObject,
      promiseFulfilled: generatePromiseLifecycleEventObject,
      promiseRejected: generatePromiseLifecycleEventObject,
      promiseResolved: generatePromiseLifecycleEventObject,
      promiseCancelled: generatePromiseLifecycleEventObject,
      promiseChained: function(name, promise, child) {
          return {promise: promise, child: child};
      },
      warning: function(name, warning) {
          return {warning: warning};
      },
      unhandledRejection: function (name, reason, promise) {
          return {reason: reason, promise: promise};
      },
      rejectionHandled: generatePromiseLifecycleEventObject
  };

  var activeFireEvent = function (name) {
      var globalEventFired = false;
      try {
          globalEventFired = fireGlobalEvent.apply(null, arguments);
      } catch (e) {
          async.throwLater(e);
          globalEventFired = true;
      }

      var domEventFired = false;
      try {
          domEventFired = fireDomEvent(name,
                      eventToObjectGenerator[name].apply(null, arguments));
      } catch (e) {
          async.throwLater(e);
          domEventFired = true;
      }

      return domEventFired || globalEventFired;
  };

  Promise.config = function(opts) {
      opts = Object(opts);
      if ("longStackTraces" in opts) {
          if (opts.longStackTraces) {
              Promise.longStackTraces();
          } else if (!opts.longStackTraces && Promise.hasLongStackTraces()) {
              disableLongStackTraces();
          }
      }
      if ("warnings" in opts) {
          var warningsOption = opts.warnings;
          config.warnings = !!warningsOption;
          wForgottenReturn = config.warnings;

          if (util$1.isObject(warningsOption)) {
              if ("wForgottenReturn" in warningsOption) {
                  wForgottenReturn = !!warningsOption.wForgottenReturn;
              }
          }
      }
      if ("cancellation" in opts && opts.cancellation && !config.cancellation) {
          if (async.haveItemsQueued()) {
              throw new Error(
                  "cannot enable cancellation after promises are in use");
          }
          Promise.prototype._clearCancellationData =
              cancellationClearCancellationData;
          Promise.prototype._propagateFrom = cancellationPropagateFrom;
          Promise.prototype._onCancel = cancellationOnCancel;
          Promise.prototype._setOnCancel = cancellationSetOnCancel;
          Promise.prototype._attachCancellationCallback =
              cancellationAttachCancellationCallback;
          Promise.prototype._execute = cancellationExecute;
          propagateFromFunction = cancellationPropagateFrom;
          config.cancellation = true;
      }
      if ("monitoring" in opts) {
          if (opts.monitoring && !config.monitoring) {
              config.monitoring = true;
              Promise.prototype._fireEvent = activeFireEvent;
          } else if (!opts.monitoring && config.monitoring) {
              config.monitoring = false;
              Promise.prototype._fireEvent = defaultFireEvent;
          }
      }
      return Promise;
  };

  function defaultFireEvent() { return false; }

  Promise.prototype._fireEvent = defaultFireEvent;
  Promise.prototype._execute = function(executor, resolve, reject) {
      try {
          executor(resolve, reject);
      } catch (e) {
          return e;
      }
  };
  Promise.prototype._onCancel = function () {};
  Promise.prototype._setOnCancel = function (handler) { };
  Promise.prototype._attachCancellationCallback = function(onCancel) {
  };
  Promise.prototype._captureStackTrace = function () {};
  Promise.prototype._attachExtraTrace = function () {};
  Promise.prototype._dereferenceTrace = function () {};
  Promise.prototype._clearCancellationData = function() {};
  Promise.prototype._propagateFrom = function (parent, flags) {
  };

  function cancellationExecute(executor, resolve, reject) {
      var promise = this;
      try {
          executor(resolve, reject, function(onCancel) {
              if (typeof onCancel !== "function") {
                  throw new TypeError("onCancel must be a function, got: " +
                                      util$1.toString(onCancel));
              }
              promise._attachCancellationCallback(onCancel);
          });
      } catch (e) {
          return e;
      }
  }

  function cancellationAttachCancellationCallback(onCancel) {
      if (!this._isCancellable()) return this;

      var previousOnCancel = this._onCancel();
      if (previousOnCancel !== undefined) {
          if (util$1.isArray(previousOnCancel)) {
              previousOnCancel.push(onCancel);
          } else {
              this._setOnCancel([previousOnCancel, onCancel]);
          }
      } else {
          this._setOnCancel(onCancel);
      }
  }

  function cancellationOnCancel() {
      return this._onCancelField;
  }

  function cancellationSetOnCancel(onCancel) {
      this._onCancelField = onCancel;
  }

  function cancellationClearCancellationData() {
      this._cancellationParent = undefined;
      this._onCancelField = undefined;
  }

  function cancellationPropagateFrom(parent, flags) {
      if ((flags & 1) !== 0) {
          this._cancellationParent = parent;
          var branchesRemainingToCancel = parent._branchesRemainingToCancel;
          if (branchesRemainingToCancel === undefined) {
              branchesRemainingToCancel = 0;
          }
          parent._branchesRemainingToCancel = branchesRemainingToCancel + 1;
      }
      if ((flags & 2) !== 0 && parent._isBound()) {
          this._setBoundTo(parent._boundTo);
      }
  }

  function bindingPropagateFrom(parent, flags) {
      if ((flags & 2) !== 0 && parent._isBound()) {
          this._setBoundTo(parent._boundTo);
      }
  }
  var propagateFromFunction = bindingPropagateFrom;

  function boundValueFunction() {
      var ret = this._boundTo;
      if (ret !== undefined) {
          if (ret instanceof Promise) {
              if (ret.isFulfilled()) {
                  return ret.value();
              } else {
                  return undefined;
              }
          }
      }
      return ret;
  }

  function longStackTracesCaptureStackTrace() {
      this._trace = new CapturedTrace(this._peekContext());
  }

  function longStackTracesAttachExtraTrace(error, ignoreSelf) {
      if (canAttachTrace(error)) {
          var trace = this._trace;
          if (trace !== undefined) {
              if (ignoreSelf) trace = trace._parent;
          }
          if (trace !== undefined) {
              trace.attachExtraTrace(error);
          } else if (!error.__stackCleaned__) {
              var parsed = parseStackAndMessage(error);
              util$1.notEnumerableProp(error, "stack",
                  parsed.message + "\n" + parsed.stack.join("\n"));
              util$1.notEnumerableProp(error, "__stackCleaned__", true);
          }
      }
  }

  function longStackTracesDereferenceTrace() {
      this._trace = undefined;
  }

  function checkForgottenReturns(returnValue, promiseCreated, name, promise,
                                 parent) {
      if (returnValue === undefined && promiseCreated !== null &&
          wForgottenReturn) {
          if (parent !== undefined && parent._returnedNonUndefined()) return;
          if ((promise._bitField & 65535) === 0) return;

          if (name) name = name + " ";
          var handlerLine = "";
          var creatorLine = "";
          if (promiseCreated._trace) {
              var traceLines = promiseCreated._trace.stack.split("\n");
              var stack = cleanStack(traceLines);
              for (var i = stack.length - 1; i >= 0; --i) {
                  var line = stack[i];
                  if (!nodeFramePattern.test(line)) {
                      var lineMatches = line.match(parseLinePattern);
                      if (lineMatches) {
                          handlerLine  = "at " + lineMatches[1] +
                              ":" + lineMatches[2] + ":" + lineMatches[3] + " ";
                      }
                      break;
                  }
              }

              if (stack.length > 0) {
                  var firstUserLine = stack[0];
                  for (var i = 0; i < traceLines.length; ++i) {

                      if (traceLines[i] === firstUserLine) {
                          if (i > 0) {
                              creatorLine = "\n" + traceLines[i - 1];
                          }
                          break;
                      }
                  }

              }
          }
          var msg = "a promise was created in a " + name +
              "handler " + handlerLine + "but was not returned from it, " +
              "see http://goo.gl/rRqMUw" +
              creatorLine;
          promise._warn(msg, true, promiseCreated);
      }
  }

  function deprecated(name, replacement) {
      var message = name +
          " is deprecated and will be removed in a future version.";
      if (replacement) message += " Use " + replacement + " instead.";
      return warn(message);
  }

  function warn(message, shouldUseOwnTrace, promise) {
      if (!config.warnings) return;
      var warning = new Warning(message);
      var ctx;
      if (shouldUseOwnTrace) {
          promise._attachExtraTrace(warning);
      } else if (config.longStackTraces && (ctx = Promise._peekContext())) {
          ctx.attachExtraTrace(warning);
      } else {
          var parsed = parseStackAndMessage(warning);
          warning.stack = parsed.message + "\n" + parsed.stack.join("\n");
      }

      if (!activeFireEvent("warning", warning)) {
          formatAndLogError(warning, "", true);
      }
  }

  function reconstructStack(message, stacks) {
      for (var i = 0; i < stacks.length - 1; ++i) {
          stacks[i].push("From previous event:");
          stacks[i] = stacks[i].join("\n");
      }
      if (i < stacks.length) {
          stacks[i] = stacks[i].join("\n");
      }
      return message + "\n" + stacks.join("\n");
  }

  function removeDuplicateOrEmptyJumps(stacks) {
      for (var i = 0; i < stacks.length; ++i) {
          if (stacks[i].length === 0 ||
              ((i + 1 < stacks.length) && stacks[i][0] === stacks[i+1][0])) {
              stacks.splice(i, 1);
              i--;
          }
      }
  }

  function removeCommonRoots(stacks) {
      var current = stacks[0];
      for (var i = 1; i < stacks.length; ++i) {
          var prev = stacks[i];
          var currentLastIndex = current.length - 1;
          var currentLastLine = current[currentLastIndex];
          var commonRootMeetPoint = -1;

          for (var j = prev.length - 1; j >= 0; --j) {
              if (prev[j] === currentLastLine) {
                  commonRootMeetPoint = j;
                  break;
              }
          }

          for (var j = commonRootMeetPoint; j >= 0; --j) {
              var line = prev[j];
              if (current[currentLastIndex] === line) {
                  current.pop();
                  currentLastIndex--;
              } else {
                  break;
              }
          }
          current = prev;
      }
  }

  function cleanStack(stack) {
      var ret = [];
      for (var i = 0; i < stack.length; ++i) {
          var line = stack[i];
          var isTraceLine = "    (No stack trace)" === line ||
              stackFramePattern.test(line);
          var isInternalFrame = isTraceLine && shouldIgnore(line);
          if (isTraceLine && !isInternalFrame) {
              if (indentStackFrames && line.charAt(0) !== " ") {
                  line = "    " + line;
              }
              ret.push(line);
          }
      }
      return ret;
  }

  function stackFramesAsArray(error) {
      var stack = error.stack.replace(/\s+$/g, "").split("\n");
      for (var i = 0; i < stack.length; ++i) {
          var line = stack[i];
          if ("    (No stack trace)" === line || stackFramePattern.test(line)) {
              break;
          }
      }
      if (i > 0 && error.name != "SyntaxError") {
          stack = stack.slice(i);
      }
      return stack;
  }

  function parseStackAndMessage(error) {
      var stack = error.stack;
      var message = error.toString();
      stack = typeof stack === "string" && stack.length > 0
                  ? stackFramesAsArray(error) : ["    (No stack trace)"];
      return {
          message: message,
          stack: error.name == "SyntaxError" ? stack : cleanStack(stack)
      };
  }

  function formatAndLogError(error, title, isSoft) {
      if (typeof console !== "undefined") {
          var message;
          if (util$1.isObject(error)) {
              var stack = error.stack;
              message = title + formatStack(stack, error);
          } else {
              message = title + String(error);
          }
          if (typeof printWarning === "function") {
              printWarning(message, isSoft);
          } else if (typeof console.log === "function" ||
              typeof console.log === "object") {
              console.log(message);
          }
      }
  }

  function fireRejectionEvent(name, localHandler, reason, promise) {
      var localEventFired = false;
      try {
          if (typeof localHandler === "function") {
              localEventFired = true;
              if (name === "rejectionHandled") {
                  localHandler(promise);
              } else {
                  localHandler(reason, promise);
              }
          }
      } catch (e) {
          async.throwLater(e);
      }

      if (name === "unhandledRejection") {
          if (!activeFireEvent(name, reason, promise) && !localEventFired) {
              formatAndLogError(reason, "Unhandled rejection ");
          }
      } else {
          activeFireEvent(name, promise);
      }
  }

  function formatNonError(obj) {
      var str;
      if (typeof obj === "function") {
          str = "[function " +
              (obj.name || "anonymous") +
              "]";
      } else {
          str = obj && typeof obj.toString === "function"
              ? obj.toString() : util$1.toString(obj);
          var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
          if (ruselessToString.test(str)) {
              try {
                  var newStr = JSON.stringify(obj);
                  str = newStr;
              }
              catch(e) {

              }
          }
          if (str.length === 0) {
              str = "(empty array)";
          }
      }
      return ("(<" + snip(str) + ">, no stack trace)");
  }

  function snip(str) {
      var maxChars = 41;
      if (str.length < maxChars) {
          return str;
      }
      return str.substr(0, maxChars - 3) + "...";
  }

  function longStackTracesIsSupported() {
      return typeof captureStackTrace === "function";
  }

  var shouldIgnore = function() { return false; };
  var parseLineInfoRegex = /[\/<\(]([^:\/]+):(\d+):(?:\d+)\)?\s*$/;
  function parseLineInfo(line) {
      var matches = line.match(parseLineInfoRegex);
      if (matches) {
          return {
              fileName: matches[1],
              line: parseInt(matches[2], 10)
          };
      }
  }

  function setBounds(firstLineError, lastLineError) {
      if (!longStackTracesIsSupported()) return;
      var firstStackLines = (firstLineError.stack || "").split("\n");
      var lastStackLines = (lastLineError.stack || "").split("\n");
      var firstIndex = -1;
      var lastIndex = -1;
      var firstFileName;
      var lastFileName;
      for (var i = 0; i < firstStackLines.length; ++i) {
          var result = parseLineInfo(firstStackLines[i]);
          if (result) {
              firstFileName = result.fileName;
              firstIndex = result.line;
              break;
          }
      }
      for (var i = 0; i < lastStackLines.length; ++i) {
          var result = parseLineInfo(lastStackLines[i]);
          if (result) {
              lastFileName = result.fileName;
              lastIndex = result.line;
              break;
          }
      }
      if (firstIndex < 0 || lastIndex < 0 || !firstFileName || !lastFileName ||
          firstFileName !== lastFileName || firstIndex >= lastIndex) {
          return;
      }

      shouldIgnore = function(line) {
          if (bluebirdFramePattern.test(line)) return true;
          var info = parseLineInfo(line);
          if (info) {
              if (info.fileName === firstFileName &&
                  (firstIndex <= info.line && info.line <= lastIndex)) {
                  return true;
              }
          }
          return false;
      };
  }

  function CapturedTrace(parent) {
      this._parent = parent;
      this._promisesCreated = 0;
      var length = this._length = 1 + (parent === undefined ? 0 : parent._length);
      captureStackTrace(this, CapturedTrace);
      if (length > 32) this.uncycle();
  }
  util$1.inherits(CapturedTrace, Error);
  Context.CapturedTrace = CapturedTrace;

  CapturedTrace.prototype.uncycle = function() {
      var length = this._length;
      if (length < 2) return;
      var nodes = [];
      var stackToIndex = {};

      for (var i = 0, node = this; node !== undefined; ++i) {
          nodes.push(node);
          node = node._parent;
      }
      length = this._length = i;
      for (var i = length - 1; i >= 0; --i) {
          var stack = nodes[i].stack;
          if (stackToIndex[stack] === undefined) {
              stackToIndex[stack] = i;
          }
      }
      for (var i = 0; i < length; ++i) {
          var currentStack = nodes[i].stack;
          var index = stackToIndex[currentStack];
          if (index !== undefined && index !== i) {
              if (index > 0) {
                  nodes[index - 1]._parent = undefined;
                  nodes[index - 1]._length = 1;
              }
              nodes[i]._parent = undefined;
              nodes[i]._length = 1;
              var cycleEdgeNode = i > 0 ? nodes[i - 1] : this;

              if (index < length - 1) {
                  cycleEdgeNode._parent = nodes[index + 1];
                  cycleEdgeNode._parent.uncycle();
                  cycleEdgeNode._length =
                      cycleEdgeNode._parent._length + 1;
              } else {
                  cycleEdgeNode._parent = undefined;
                  cycleEdgeNode._length = 1;
              }
              var currentChildLength = cycleEdgeNode._length + 1;
              for (var j = i - 2; j >= 0; --j) {
                  nodes[j]._length = currentChildLength;
                  currentChildLength++;
              }
              return;
          }
      }
  };

  CapturedTrace.prototype.attachExtraTrace = function(error) {
      if (error.__stackCleaned__) return;
      this.uncycle();
      var parsed = parseStackAndMessage(error);
      var message = parsed.message;
      var stacks = [parsed.stack];

      var trace = this;
      while (trace !== undefined) {
          stacks.push(cleanStack(trace.stack.split("\n")));
          trace = trace._parent;
      }
      removeCommonRoots(stacks);
      removeDuplicateOrEmptyJumps(stacks);
      util$1.notEnumerableProp(error, "stack", reconstructStack(message, stacks));
      util$1.notEnumerableProp(error, "__stackCleaned__", true);
  };

  var captureStackTrace = (function stackDetection() {
      var v8stackFramePattern = /^\s*at\s*/;
      var v8stackFormatter = function(stack, error) {
          if (typeof stack === "string") return stack;

          if (error.name !== undefined &&
              error.message !== undefined) {
              return error.toString();
          }
          return formatNonError(error);
      };

      if (typeof Error.stackTraceLimit === "number" &&
          typeof Error.captureStackTrace === "function") {
          Error.stackTraceLimit += 6;
          stackFramePattern = v8stackFramePattern;
          formatStack = v8stackFormatter;
          var captureStackTrace = Error.captureStackTrace;

          shouldIgnore = function(line) {
              return bluebirdFramePattern.test(line);
          };
          return function(receiver, ignoreUntil) {
              Error.stackTraceLimit += 6;
              captureStackTrace(receiver, ignoreUntil);
              Error.stackTraceLimit -= 6;
          };
      }
      var err = new Error();

      if (typeof err.stack === "string" &&
          err.stack.split("\n")[0].indexOf("stackDetection@") >= 0) {
          stackFramePattern = /@/;
          formatStack = v8stackFormatter;
          indentStackFrames = true;
          return function captureStackTrace(o) {
              o.stack = new Error().stack;
          };
      }

      var hasStackAfterThrow;
      try { throw new Error(); }
      catch(e) {
          hasStackAfterThrow = ("stack" in e);
      }
      if (!("stack" in err) && hasStackAfterThrow &&
          typeof Error.stackTraceLimit === "number") {
          stackFramePattern = v8stackFramePattern;
          formatStack = v8stackFormatter;
          return function captureStackTrace(o) {
              Error.stackTraceLimit += 6;
              try { throw new Error(); }
              catch(e) { o.stack = e.stack; }
              Error.stackTraceLimit -= 6;
          };
      }

      formatStack = function(stack, error) {
          if (typeof stack === "string") return stack;

          if ((typeof error === "object" ||
              typeof error === "function") &&
              error.name !== undefined &&
              error.message !== undefined) {
              return error.toString();
          }
          return formatNonError(error);
      };

      return null;

  })();

  if (typeof console !== "undefined" && typeof console.warn !== "undefined") {
      printWarning = function (message) {
          console.warn(message);
      };
      if (util$1.isNode && process.stderr.isTTY) {
          printWarning = function(message, isSoft) {
              var color = isSoft ? "\u001b[33m" : "\u001b[31m";
              console.warn(color + message + "\u001b[0m\n");
          };
      } else if (!util$1.isNode && typeof (new Error().stack) === "string") {
          printWarning = function(message, isSoft) {
              console.warn("%c" + message,
                          isSoft ? "color: darkorange" : "color: red");
          };
      }
  }

  var config = {
      warnings: warnings,
      longStackTraces: false,
      cancellation: false,
      monitoring: false
  };

  if (longStackTraces) Promise.longStackTraces();

  return {
      longStackTraces: function() {
          return config.longStackTraces;
      },
      warnings: function() {
          return config.warnings;
      },
      cancellation: function() {
          return config.cancellation;
      },
      monitoring: function() {
          return config.monitoring;
      },
      propagateFromFunction: function() {
          return propagateFromFunction;
      },
      boundValueFunction: function() {
          return boundValueFunction;
      },
      checkForgottenReturns: checkForgottenReturns,
      setBounds: setBounds,
      warn: warn,
      deprecated: deprecated,
      CapturedTrace: CapturedTrace,
      fireDomEvent: fireDomEvent,
      fireGlobalEvent: fireGlobalEvent
  };
  };

  var catch_filter = function(NEXT_FILTER) {
  var util$1 = util;
  var getKeys = es5.keys;
  var tryCatch = util$1.tryCatch;
  var errorObj = util$1.errorObj;

  function catchFilter(instances, cb, promise) {
      return function(e) {
          var boundTo = promise._boundValue();
          predicateLoop: for (var i = 0; i < instances.length; ++i) {
              var item = instances[i];

              if (item === Error ||
                  (item != null && item.prototype instanceof Error)) {
                  if (e instanceof item) {
                      return tryCatch(cb).call(boundTo, e);
                  }
              } else if (typeof item === "function") {
                  var matchesPredicate = tryCatch(item).call(boundTo, e);
                  if (matchesPredicate === errorObj) {
                      return matchesPredicate;
                  } else if (matchesPredicate) {
                      return tryCatch(cb).call(boundTo, e);
                  }
              } else if (util$1.isObject(e)) {
                  var keys = getKeys(item);
                  for (var j = 0; j < keys.length; ++j) {
                      var key = keys[j];
                      if (item[key] != e[key]) {
                          continue predicateLoop;
                      }
                  }
                  return tryCatch(cb).call(boundTo, e);
              }
          }
          return NEXT_FILTER;
      };
  }

  return catchFilter;
  };

  var _finally = function(Promise, tryConvertToPromise, NEXT_FILTER) {
  var util$1 = util;
  var CancellationError = Promise.CancellationError;
  var errorObj = util$1.errorObj;
  var catchFilter = catch_filter(NEXT_FILTER);

  function PassThroughHandlerContext(promise, type, handler) {
      this.promise = promise;
      this.type = type;
      this.handler = handler;
      this.called = false;
      this.cancelPromise = null;
  }

  PassThroughHandlerContext.prototype.isFinallyHandler = function() {
      return this.type === 0;
  };

  function FinallyHandlerCancelReaction(finallyHandler) {
      this.finallyHandler = finallyHandler;
  }

  FinallyHandlerCancelReaction.prototype._resultCancelled = function() {
      checkCancel(this.finallyHandler);
  };

  function checkCancel(ctx, reason) {
      if (ctx.cancelPromise != null) {
          if (arguments.length > 1) {
              ctx.cancelPromise._reject(reason);
          } else {
              ctx.cancelPromise._cancel();
          }
          ctx.cancelPromise = null;
          return true;
      }
      return false;
  }

  function succeed() {
      return finallyHandler.call(this, this.promise._target()._settledValue());
  }
  function fail(reason) {
      if (checkCancel(this, reason)) return;
      errorObj.e = reason;
      return errorObj;
  }
  function finallyHandler(reasonOrValue) {
      var promise = this.promise;
      var handler = this.handler;

      if (!this.called) {
          this.called = true;
          var ret = this.isFinallyHandler()
              ? handler.call(promise._boundValue())
              : handler.call(promise._boundValue(), reasonOrValue);
          if (ret === NEXT_FILTER) {
              return ret;
          } else if (ret !== undefined) {
              promise._setReturnedNonUndefined();
              var maybePromise = tryConvertToPromise(ret, promise);
              if (maybePromise instanceof Promise) {
                  if (this.cancelPromise != null) {
                      if (maybePromise._isCancelled()) {
                          var reason =
                              new CancellationError("late cancellation observer");
                          promise._attachExtraTrace(reason);
                          errorObj.e = reason;
                          return errorObj;
                      } else if (maybePromise.isPending()) {
                          maybePromise._attachCancellationCallback(
                              new FinallyHandlerCancelReaction(this));
                      }
                  }
                  return maybePromise._then(
                      succeed, fail, undefined, this, undefined);
              }
          }
      }

      if (promise.isRejected()) {
          checkCancel(this);
          errorObj.e = reasonOrValue;
          return errorObj;
      } else {
          checkCancel(this);
          return reasonOrValue;
      }
  }

  Promise.prototype._passThrough = function(handler, type, success, fail) {
      if (typeof handler !== "function") return this.then();
      return this._then(success,
                        fail,
                        undefined,
                        new PassThroughHandlerContext(this, type, handler),
                        undefined);
  };

  Promise.prototype.lastly =
  Promise.prototype["finally"] = function (handler) {
      return this._passThrough(handler,
                               0,
                               finallyHandler,
                               finallyHandler);
  };


  Promise.prototype.tap = function (handler) {
      return this._passThrough(handler, 1, finallyHandler);
  };

  Promise.prototype.tapCatch = function (handlerOrPredicate) {
      var len = arguments.length;
      if(len === 1) {
          return this._passThrough(handlerOrPredicate,
                                   1,
                                   undefined,
                                   finallyHandler);
      } else {
           var catchInstances = new Array(len - 1),
              j = 0, i;
          for (i = 0; i < len - 1; ++i) {
              var item = arguments[i];
              if (util$1.isObject(item)) {
                  catchInstances[j++] = item;
              } else {
                  return Promise.reject(new TypeError(
                      "tapCatch statement predicate: "
                      + "expecting an object but got " + util$1.classString(item)
                  ));
              }
          }
          catchInstances.length = j;
          var handler = arguments[i];
          return this._passThrough(catchFilter(catchInstances, handler, this),
                                   1,
                                   undefined,
                                   finallyHandler);
      }

  };

  return PassThroughHandlerContext;
  };

  var maybeWrapAsError$1 = util.maybeWrapAsError;

  var OperationalError$1 = errors.OperationalError;


  function isUntypedError(obj) {
      return obj instanceof Error &&
          es5.getPrototypeOf(obj) === Error.prototype;
  }

  var rErrorKey = /^(?:name|message|stack|cause)$/;
  function wrapAsOperationalError(obj) {
      var ret;
      if (isUntypedError(obj)) {
          ret = new OperationalError$1(obj);
          ret.name = obj.name;
          ret.message = obj.message;
          ret.stack = obj.stack;
          var keys = es5.keys(obj);
          for (var i = 0; i < keys.length; ++i) {
              var key = keys[i];
              if (!rErrorKey.test(key)) {
                  ret[key] = obj[key];
              }
          }
          return ret;
      }
      util.markAsOriginatingFromRejection(obj);
      return obj;
  }

  function nodebackForPromise(promise, multiArgs) {
      return function(err, value) {
          if (promise === null) return;
          if (err) {
              var wrapped = wrapAsOperationalError(maybeWrapAsError$1(err));
              promise._attachExtraTrace(wrapped);
              promise._reject(wrapped);
          } else if (!multiArgs) {
              promise._fulfill(value);
          } else {
              var $_len = arguments.length;var args = new Array(Math.max($_len - 1, 0)); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}            promise._fulfill(args);
          }
          promise = null;
      };
  }

  var nodeback = nodebackForPromise;

  var method =
  function(Promise, INTERNAL, tryConvertToPromise, apiRejection, debug) {
  var util$1 = util;
  var tryCatch = util$1.tryCatch;

  Promise.method = function (fn) {
      if (typeof fn !== "function") {
          throw new Promise.TypeError("expecting a function but got " + util$1.classString(fn));
      }
      return function () {
          var ret = new Promise(INTERNAL);
          ret._captureStackTrace();
          ret._pushContext();
          var value = tryCatch(fn).apply(this, arguments);
          var promiseCreated = ret._popContext();
          debug.checkForgottenReturns(
              value, promiseCreated, "Promise.method", ret);
          ret._resolveFromSyncValue(value);
          return ret;
      };
  };

  Promise.attempt = Promise["try"] = function (fn) {
      if (typeof fn !== "function") {
          return apiRejection("expecting a function but got " + util$1.classString(fn));
      }
      var ret = new Promise(INTERNAL);
      ret._captureStackTrace();
      ret._pushContext();
      var value;
      if (arguments.length > 1) {
          debug.deprecated("calling Promise.try with more than 1 argument");
          var arg = arguments[1];
          var ctx = arguments[2];
          value = util$1.isArray(arg) ? tryCatch(fn).apply(ctx, arg)
                                    : tryCatch(fn).call(ctx, arg);
      } else {
          value = tryCatch(fn)();
      }
      var promiseCreated = ret._popContext();
      debug.checkForgottenReturns(
          value, promiseCreated, "Promise.try", ret);
      ret._resolveFromSyncValue(value);
      return ret;
  };

  Promise.prototype._resolveFromSyncValue = function (value) {
      if (value === util$1.errorObj) {
          this._rejectCallback(value.e, false);
      } else {
          this._resolveCallback(value, true);
      }
  };
  };

  var bind = function(Promise, INTERNAL, tryConvertToPromise, debug) {
  var calledBind = false;
  var rejectThis = function(_, e) {
      this._reject(e);
  };

  var targetRejected = function(e, context) {
      context.promiseRejectionQueued = true;
      context.bindingPromise._then(rejectThis, rejectThis, null, this, e);
  };

  var bindingResolved = function(thisArg, context) {
      if (((this._bitField & 50397184) === 0)) {
          this._resolveCallback(context.target);
      }
  };

  var bindingRejected = function(e, context) {
      if (!context.promiseRejectionQueued) this._reject(e);
  };

  Promise.prototype.bind = function (thisArg) {
      if (!calledBind) {
          calledBind = true;
          Promise.prototype._propagateFrom = debug.propagateFromFunction();
          Promise.prototype._boundValue = debug.boundValueFunction();
      }
      var maybePromise = tryConvertToPromise(thisArg);
      var ret = new Promise(INTERNAL);
      ret._propagateFrom(this, 1);
      var target = this._target();
      ret._setBoundTo(maybePromise);
      if (maybePromise instanceof Promise) {
          var context = {
              promiseRejectionQueued: false,
              promise: ret,
              target: target,
              bindingPromise: maybePromise
          };
          target._then(INTERNAL, targetRejected, undefined, ret, context);
          maybePromise._then(
              bindingResolved, bindingRejected, undefined, ret, context);
          ret._setOnCancel(maybePromise);
      } else {
          ret._resolveCallback(target);
      }
      return ret;
  };

  Promise.prototype._setBoundTo = function (obj) {
      if (obj !== undefined) {
          this._bitField = this._bitField | 2097152;
          this._boundTo = obj;
      } else {
          this._bitField = this._bitField & (~2097152);
      }
  };

  Promise.prototype._isBound = function () {
      return (this._bitField & 2097152) === 2097152;
  };

  Promise.bind = function (thisArg, value) {
      return Promise.resolve(value).bind(thisArg);
  };
  };

  var cancel = function(Promise, PromiseArray, apiRejection, debug) {
  var util$1 = util;
  var tryCatch = util$1.tryCatch;
  var errorObj = util$1.errorObj;
  var async = Promise._async;

  Promise.prototype["break"] = Promise.prototype.cancel = function() {
      if (!debug.cancellation()) return this._warn("cancellation is disabled");

      var promise = this;
      var child = promise;
      while (promise._isCancellable()) {
          if (!promise._cancelBy(child)) {
              if (child._isFollowing()) {
                  child._followee().cancel();
              } else {
                  child._cancelBranched();
              }
              break;
          }

          var parent = promise._cancellationParent;
          if (parent == null || !parent._isCancellable()) {
              if (promise._isFollowing()) {
                  promise._followee().cancel();
              } else {
                  promise._cancelBranched();
              }
              break;
          } else {
              if (promise._isFollowing()) promise._followee().cancel();
              promise._setWillBeCancelled();
              child = promise;
              promise = parent;
          }
      }
  };

  Promise.prototype._branchHasCancelled = function() {
      this._branchesRemainingToCancel--;
  };

  Promise.prototype._enoughBranchesHaveCancelled = function() {
      return this._branchesRemainingToCancel === undefined ||
             this._branchesRemainingToCancel <= 0;
  };

  Promise.prototype._cancelBy = function(canceller) {
      if (canceller === this) {
          this._branchesRemainingToCancel = 0;
          this._invokeOnCancel();
          return true;
      } else {
          this._branchHasCancelled();
          if (this._enoughBranchesHaveCancelled()) {
              this._invokeOnCancel();
              return true;
          }
      }
      return false;
  };

  Promise.prototype._cancelBranched = function() {
      if (this._enoughBranchesHaveCancelled()) {
          this._cancel();
      }
  };

  Promise.prototype._cancel = function() {
      if (!this._isCancellable()) return;
      this._setCancelled();
      async.invoke(this._cancelPromises, this, undefined);
  };

  Promise.prototype._cancelPromises = function() {
      if (this._length() > 0) this._settlePromises();
  };

  Promise.prototype._unsetOnCancel = function() {
      this._onCancelField = undefined;
  };

  Promise.prototype._isCancellable = function() {
      return this.isPending() && !this._isCancelled();
  };

  Promise.prototype.isCancellable = function() {
      return this.isPending() && !this.isCancelled();
  };

  Promise.prototype._doInvokeOnCancel = function(onCancelCallback, internalOnly) {
      if (util$1.isArray(onCancelCallback)) {
          for (var i = 0; i < onCancelCallback.length; ++i) {
              this._doInvokeOnCancel(onCancelCallback[i], internalOnly);
          }
      } else if (onCancelCallback !== undefined) {
          if (typeof onCancelCallback === "function") {
              if (!internalOnly) {
                  var e = tryCatch(onCancelCallback).call(this._boundValue());
                  if (e === errorObj) {
                      this._attachExtraTrace(e.e);
                      async.throwLater(e.e);
                  }
              }
          } else {
              onCancelCallback._resultCancelled(this);
          }
      }
  };

  Promise.prototype._invokeOnCancel = function() {
      var onCancelCallback = this._onCancel();
      this._unsetOnCancel();
      async.invoke(this._doInvokeOnCancel, this, onCancelCallback);
  };

  Promise.prototype._invokeInternalOnCancel = function() {
      if (this._isCancellable()) {
          this._doInvokeOnCancel(this._onCancel(), true);
          this._unsetOnCancel();
      }
  };

  Promise.prototype._resultCancelled = function() {
      this.cancel();
  };

  };

  var direct_resolve = function(Promise) {
  function returner() {
      return this.value;
  }
  function thrower() {
      throw this.reason;
  }

  Promise.prototype["return"] =
  Promise.prototype.thenReturn = function (value) {
      if (value instanceof Promise) value.suppressUnhandledRejections();
      return this._then(
          returner, undefined, undefined, {value: value}, undefined);
  };

  Promise.prototype["throw"] =
  Promise.prototype.thenThrow = function (reason) {
      return this._then(
          thrower, undefined, undefined, {reason: reason}, undefined);
  };

  Promise.prototype.catchThrow = function (reason) {
      if (arguments.length <= 1) {
          return this._then(
              undefined, thrower, undefined, {reason: reason}, undefined);
      } else {
          var _reason = arguments[1];
          var handler = function() {throw _reason;};
          return this.caught(reason, handler);
      }
  };

  Promise.prototype.catchReturn = function (value) {
      if (arguments.length <= 1) {
          if (value instanceof Promise) value.suppressUnhandledRejections();
          return this._then(
              undefined, returner, undefined, {value: value}, undefined);
      } else {
          var _value = arguments[1];
          if (_value instanceof Promise) _value.suppressUnhandledRejections();
          var handler = function() {return _value;};
          return this.caught(value, handler);
      }
  };
  };

  var synchronous_inspection = function(Promise) {
  function PromiseInspection(promise) {
      if (promise !== undefined) {
          promise = promise._target();
          this._bitField = promise._bitField;
          this._settledValueField = promise._isFateSealed()
              ? promise._settledValue() : undefined;
      }
      else {
          this._bitField = 0;
          this._settledValueField = undefined;
      }
  }

  PromiseInspection.prototype._settledValue = function() {
      return this._settledValueField;
  };

  var value = PromiseInspection.prototype.value = function () {
      if (!this.isFulfilled()) {
          throw new TypeError("cannot get fulfillment value of a non-fulfilled promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      return this._settledValue();
  };

  var reason = PromiseInspection.prototype.error =
  PromiseInspection.prototype.reason = function () {
      if (!this.isRejected()) {
          throw new TypeError("cannot get rejection reason of a non-rejected promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      return this._settledValue();
  };

  var isFulfilled = PromiseInspection.prototype.isFulfilled = function() {
      return (this._bitField & 33554432) !== 0;
  };

  var isRejected = PromiseInspection.prototype.isRejected = function () {
      return (this._bitField & 16777216) !== 0;
  };

  var isPending = PromiseInspection.prototype.isPending = function () {
      return (this._bitField & 50397184) === 0;
  };

  var isResolved = PromiseInspection.prototype.isResolved = function () {
      return (this._bitField & 50331648) !== 0;
  };

  PromiseInspection.prototype.isCancelled = function() {
      return (this._bitField & 8454144) !== 0;
  };

  Promise.prototype.__isCancelled = function() {
      return (this._bitField & 65536) === 65536;
  };

  Promise.prototype._isCancelled = function() {
      return this._target().__isCancelled();
  };

  Promise.prototype.isCancelled = function() {
      return (this._target()._bitField & 8454144) !== 0;
  };

  Promise.prototype.isPending = function() {
      return isPending.call(this._target());
  };

  Promise.prototype.isRejected = function() {
      return isRejected.call(this._target());
  };

  Promise.prototype.isFulfilled = function() {
      return isFulfilled.call(this._target());
  };

  Promise.prototype.isResolved = function() {
      return isResolved.call(this._target());
  };

  Promise.prototype.value = function() {
      return value.call(this._target());
  };

  Promise.prototype.reason = function() {
      var target = this._target();
      target._unsetRejectionIsUnhandled();
      return reason.call(target);
  };

  Promise.prototype._value = function() {
      return this._settledValue();
  };

  Promise.prototype._reason = function() {
      this._unsetRejectionIsUnhandled();
      return this._settledValue();
  };

  Promise.PromiseInspection = PromiseInspection;
  };

  var join =
  function(Promise, PromiseArray, tryConvertToPromise, INTERNAL, async,
           getDomain) {
  var util$1 = util;
  var canEvaluate = util$1.canEvaluate;
  var tryCatch = util$1.tryCatch;
  var errorObj = util$1.errorObj;
  var reject;

  {
  if (canEvaluate) {
      var thenCallback = function(i) {
          return new Function("value", "holder", "                             \n\
            'use strict';                                                    \n\
            holder.pIndex = value;                                           \n\
            holder.checkFulfillment(this);                                   \n\
            ".replace(/Index/g, i));
      };

      var promiseSetter = function(i) {
          return new Function("promise", "holder", "                           \n\
            'use strict';                                                    \n\
            holder.pIndex = promise;                                         \n\
            ".replace(/Index/g, i));
      };

      var generateHolderClass = function(total) {
          var props = new Array(total);
          for (var i = 0; i < props.length; ++i) {
              props[i] = "this.p" + (i+1);
          }
          var assignment = props.join(" = ") + " = null;";
          var cancellationCode= "var promise;\n" + props.map(function(prop) {
              return "                                                         \n\
                promise = " + prop + ";                                      \n\
                if (promise instanceof Promise) {                            \n\
                    promise.cancel();                                        \n\
                }                                                            \n\
            ";
          }).join("\n");
          var passedArguments = props.join(", ");
          var name = "Holder$" + total;


          var code = "return function(tryCatch, errorObj, Promise, async) {    \n\
            'use strict';                                                    \n\
            function [TheName](fn) {                                         \n\
                [TheProperties]                                              \n\
                this.fn = fn;                                                \n\
                this.asyncNeeded = true;                                     \n\
                this.now = 0;                                                \n\
            }                                                                \n\
                                                                             \n\
            [TheName].prototype._callFunction = function(promise) {          \n\
                promise._pushContext();                                      \n\
                var ret = tryCatch(this.fn)([ThePassedArguments]);           \n\
                promise._popContext();                                       \n\
                if (ret === errorObj) {                                      \n\
                    promise._rejectCallback(ret.e, false);                   \n\
                } else {                                                     \n\
                    promise._resolveCallback(ret);                           \n\
                }                                                            \n\
            };                                                               \n\
                                                                             \n\
            [TheName].prototype.checkFulfillment = function(promise) {       \n\
                var now = ++this.now;                                        \n\
                if (now === [TheTotal]) {                                    \n\
                    if (this.asyncNeeded) {                                  \n\
                        async.invoke(this._callFunction, this, promise);     \n\
                    } else {                                                 \n\
                        this._callFunction(promise);                         \n\
                    }                                                        \n\
                                                                             \n\
                }                                                            \n\
            };                                                               \n\
                                                                             \n\
            [TheName].prototype._resultCancelled = function() {              \n\
                [CancellationCode]                                           \n\
            };                                                               \n\
                                                                             \n\
            return [TheName];                                                \n\
        }(tryCatch, errorObj, Promise, async);                               \n\
        ";

          code = code.replace(/\[TheName\]/g, name)
              .replace(/\[TheTotal\]/g, total)
              .replace(/\[ThePassedArguments\]/g, passedArguments)
              .replace(/\[TheProperties\]/g, assignment)
              .replace(/\[CancellationCode\]/g, cancellationCode);

          return new Function("tryCatch", "errorObj", "Promise", "async", code)
                             (tryCatch, errorObj, Promise, async);
      };

      var holderClasses = [];
      var thenCallbacks = [];
      var promiseSetters = [];

      for (var i = 0; i < 8; ++i) {
          holderClasses.push(generateHolderClass(i + 1));
          thenCallbacks.push(thenCallback(i + 1));
          promiseSetters.push(promiseSetter(i + 1));
      }

      reject = function (reason) {
          this._reject(reason);
      };
  }}

  Promise.join = function () {
      var last = arguments.length - 1;
      var fn;
      if (last > 0 && typeof arguments[last] === "function") {
          fn = arguments[last];
          {
              if (last <= 8 && canEvaluate) {
                  var ret = new Promise(INTERNAL);
                  ret._captureStackTrace();
                  var HolderClass = holderClasses[last - 1];
                  var holder = new HolderClass(fn);
                  var callbacks = thenCallbacks;

                  for (var i = 0; i < last; ++i) {
                      var maybePromise = tryConvertToPromise(arguments[i], ret);
                      if (maybePromise instanceof Promise) {
                          maybePromise = maybePromise._target();
                          var bitField = maybePromise._bitField;
                          if (((bitField & 50397184) === 0)) {
                              maybePromise._then(callbacks[i], reject,
                                                 undefined, ret, holder);
                              promiseSetters[i](maybePromise, holder);
                              holder.asyncNeeded = false;
                          } else if (((bitField & 33554432) !== 0)) {
                              callbacks[i].call(ret,
                                                maybePromise._value(), holder);
                          } else if (((bitField & 16777216) !== 0)) {
                              ret._reject(maybePromise._reason());
                          } else {
                              ret._cancel();
                          }
                      } else {
                          callbacks[i].call(ret, maybePromise, holder);
                      }
                  }

                  if (!ret._isFateSealed()) {
                      if (holder.asyncNeeded) {
                          var domain = getDomain();
                          if (domain !== null) {
                              holder.fn = util$1.domainBind(domain, holder.fn);
                          }
                      }
                      ret._setAsyncGuaranteed();
                      ret._setOnCancel(holder);
                  }
                  return ret;
              }
          }
      }
      var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}    if (fn) args.pop();
      var ret = new PromiseArray(args).promise();
      return fn !== undefined ? ret.spread(fn) : ret;
  };

  };

  var cr = Object.create;
  if (cr) {
      var callerCache = cr(null);
      var getterCache = cr(null);
      callerCache[" size"] = getterCache[" size"] = 0;
  }

  var call_get = function(Promise) {
  var util$1 = util;
  var canEvaluate = util$1.canEvaluate;
  var isIdentifier = util$1.isIdentifier;

  var getMethodCaller;
  var getGetter;
  {
  var makeMethodCaller = function (methodName) {
      return new Function("ensureMethod", "                                    \n\
        return function(obj) {                                               \n\
            'use strict'                                                     \n\
            var len = this.length;                                           \n\
            ensureMethod(obj, 'methodName');                                 \n\
            switch(len) {                                                    \n\
                case 1: return obj.methodName(this[0]);                      \n\
                case 2: return obj.methodName(this[0], this[1]);             \n\
                case 3: return obj.methodName(this[0], this[1], this[2]);    \n\
                case 0: return obj.methodName();                             \n\
                default:                                                     \n\
                    return obj.methodName.apply(obj, this);                  \n\
            }                                                                \n\
        };                                                                   \n\
        ".replace(/methodName/g, methodName))(ensureMethod);
  };

  var makeGetter = function (propertyName) {
      return new Function("obj", "                                             \n\
        'use strict';                                                        \n\
        return obj.propertyName;                                             \n\
        ".replace("propertyName", propertyName));
  };

  var getCompiled = function(name, compiler, cache) {
      var ret = cache[name];
      if (typeof ret !== "function") {
          if (!isIdentifier(name)) {
              return null;
          }
          ret = compiler(name);
          cache[name] = ret;
          cache[" size"]++;
          if (cache[" size"] > 512) {
              var keys = Object.keys(cache);
              for (var i = 0; i < 256; ++i) delete cache[keys[i]];
              cache[" size"] = keys.length - 256;
          }
      }
      return ret;
  };

  getMethodCaller = function(name) {
      return getCompiled(name, makeMethodCaller, callerCache);
  };

  getGetter = function(name) {
      return getCompiled(name, makeGetter, getterCache);
  };
  }

  function ensureMethod(obj, methodName) {
      var fn;
      if (obj != null) fn = obj[methodName];
      if (typeof fn !== "function") {
          var message = "Object " + util$1.classString(obj) + " has no method '" +
              util$1.toString(methodName) + "'";
          throw new Promise.TypeError(message);
      }
      return fn;
  }

  function caller(obj) {
      var methodName = this.pop();
      var fn = ensureMethod(obj, methodName);
      return fn.apply(obj, this);
  }
  Promise.prototype.call = function (methodName) {
      var $_len = arguments.length;var args = new Array(Math.max($_len - 1, 0)); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}    {
          if (canEvaluate) {
              var maybeCaller = getMethodCaller(methodName);
              if (maybeCaller !== null) {
                  return this._then(
                      maybeCaller, undefined, undefined, args, undefined);
              }
          }
      }
      args.push(methodName);
      return this._then(caller, undefined, undefined, args, undefined);
  };

  function namedGetter(obj) {
      return obj[this];
  }
  function indexedGetter(obj) {
      var index = +this;
      if (index < 0) index = Math.max(0, index + obj.length);
      return obj[index];
  }
  Promise.prototype.get = function (propertyName) {
      var isIndex = (typeof propertyName === "number");
      var getter;
      if (!isIndex) {
          if (canEvaluate) {
              var maybeGetter = getGetter(propertyName);
              getter = maybeGetter !== null ? maybeGetter : namedGetter;
          } else {
              getter = namedGetter;
          }
      } else {
          getter = indexedGetter;
      }
      return this._then(getter, undefined, undefined, propertyName, undefined);
  };
  };

  var generators = function(Promise,
                            apiRejection,
                            INTERNAL,
                            tryConvertToPromise,
                            Proxyable,
                            debug) {
  var errors$1 = errors;
  var TypeError = errors$1.TypeError;
  var util$1 = util;
  var errorObj = util$1.errorObj;
  var tryCatch = util$1.tryCatch;
  var yieldHandlers = [];

  function promiseFromYieldHandler(value, yieldHandlers, traceParent) {
      for (var i = 0; i < yieldHandlers.length; ++i) {
          traceParent._pushContext();
          var result = tryCatch(yieldHandlers[i])(value);
          traceParent._popContext();
          if (result === errorObj) {
              traceParent._pushContext();
              var ret = Promise.reject(errorObj.e);
              traceParent._popContext();
              return ret;
          }
          var maybePromise = tryConvertToPromise(result, traceParent);
          if (maybePromise instanceof Promise) return maybePromise;
      }
      return null;
  }

  function PromiseSpawn(generatorFunction, receiver, yieldHandler, stack) {
      if (debug.cancellation()) {
          var internal = new Promise(INTERNAL);
          var _finallyPromise = this._finallyPromise = new Promise(INTERNAL);
          this._promise = internal.lastly(function() {
              return _finallyPromise;
          });
          internal._captureStackTrace();
          internal._setOnCancel(this);
      } else {
          var promise = this._promise = new Promise(INTERNAL);
          promise._captureStackTrace();
      }
      this._stack = stack;
      this._generatorFunction = generatorFunction;
      this._receiver = receiver;
      this._generator = undefined;
      this._yieldHandlers = typeof yieldHandler === "function"
          ? [yieldHandler].concat(yieldHandlers)
          : yieldHandlers;
      this._yieldedPromise = null;
      this._cancellationPhase = false;
  }
  util$1.inherits(PromiseSpawn, Proxyable);

  PromiseSpawn.prototype._isResolved = function() {
      return this._promise === null;
  };

  PromiseSpawn.prototype._cleanup = function() {
      this._promise = this._generator = null;
      if (debug.cancellation() && this._finallyPromise !== null) {
          this._finallyPromise._fulfill();
          this._finallyPromise = null;
      }
  };

  PromiseSpawn.prototype._promiseCancelled = function() {
      if (this._isResolved()) return;
      var implementsReturn = typeof this._generator["return"] !== "undefined";

      var result;
      if (!implementsReturn) {
          var reason = new Promise.CancellationError(
              "generator .return() sentinel");
          Promise.coroutine.returnSentinel = reason;
          this._promise._attachExtraTrace(reason);
          this._promise._pushContext();
          result = tryCatch(this._generator["throw"]).call(this._generator,
                                                           reason);
          this._promise._popContext();
      } else {
          this._promise._pushContext();
          result = tryCatch(this._generator["return"]).call(this._generator,
                                                            undefined);
          this._promise._popContext();
      }
      this._cancellationPhase = true;
      this._yieldedPromise = null;
      this._continue(result);
  };

  PromiseSpawn.prototype._promiseFulfilled = function(value) {
      this._yieldedPromise = null;
      this._promise._pushContext();
      var result = tryCatch(this._generator.next).call(this._generator, value);
      this._promise._popContext();
      this._continue(result);
  };

  PromiseSpawn.prototype._promiseRejected = function(reason) {
      this._yieldedPromise = null;
      this._promise._attachExtraTrace(reason);
      this._promise._pushContext();
      var result = tryCatch(this._generator["throw"])
          .call(this._generator, reason);
      this._promise._popContext();
      this._continue(result);
  };

  PromiseSpawn.prototype._resultCancelled = function() {
      if (this._yieldedPromise instanceof Promise) {
          var promise = this._yieldedPromise;
          this._yieldedPromise = null;
          promise.cancel();
      }
  };

  PromiseSpawn.prototype.promise = function () {
      return this._promise;
  };

  PromiseSpawn.prototype._run = function () {
      this._generator = this._generatorFunction.call(this._receiver);
      this._receiver =
          this._generatorFunction = undefined;
      this._promiseFulfilled(undefined);
  };

  PromiseSpawn.prototype._continue = function (result) {
      var promise = this._promise;
      if (result === errorObj) {
          this._cleanup();
          if (this._cancellationPhase) {
              return promise.cancel();
          } else {
              return promise._rejectCallback(result.e, false);
          }
      }

      var value = result.value;
      if (result.done === true) {
          this._cleanup();
          if (this._cancellationPhase) {
              return promise.cancel();
          } else {
              return promise._resolveCallback(value);
          }
      } else {
          var maybePromise = tryConvertToPromise(value, this._promise);
          if (!(maybePromise instanceof Promise)) {
              maybePromise =
                  promiseFromYieldHandler(maybePromise,
                                          this._yieldHandlers,
                                          this._promise);
              if (maybePromise === null) {
                  this._promiseRejected(
                      new TypeError(
                          "A value %s was yielded that could not be treated as a promise\u000a\u000a    See http://goo.gl/MqrFmX\u000a\u000a".replace("%s", String(value)) +
                          "From coroutine:\u000a" +
                          this._stack.split("\n").slice(1, -7).join("\n")
                      )
                  );
                  return;
              }
          }
          maybePromise = maybePromise._target();
          var bitField = maybePromise._bitField;
          if (((bitField & 50397184) === 0)) {
              this._yieldedPromise = maybePromise;
              maybePromise._proxy(this, null);
          } else if (((bitField & 33554432) !== 0)) {
              Promise._async.invoke(
                  this._promiseFulfilled, this, maybePromise._value()
              );
          } else if (((bitField & 16777216) !== 0)) {
              Promise._async.invoke(
                  this._promiseRejected, this, maybePromise._reason()
              );
          } else {
              this._promiseCancelled();
          }
      }
  };

  Promise.coroutine = function (generatorFunction, options) {
      if (typeof generatorFunction !== "function") {
          throw new TypeError("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      var yieldHandler = Object(options).yieldHandler;
      var PromiseSpawn$ = PromiseSpawn;
      var stack = new Error().stack;
      return function () {
          var generator = generatorFunction.apply(this, arguments);
          var spawn = new PromiseSpawn$(undefined, undefined, yieldHandler,
                                        stack);
          var ret = spawn.promise();
          spawn._generator = generator;
          spawn._promiseFulfilled(undefined);
          return ret;
      };
  };

  Promise.coroutine.addYieldHandler = function(fn) {
      if (typeof fn !== "function") {
          throw new TypeError("expecting a function but got " + util$1.classString(fn));
      }
      yieldHandlers.push(fn);
  };

  Promise.spawn = function (generatorFunction) {
      debug.deprecated("Promise.spawn()", "Promise.coroutine()");
      if (typeof generatorFunction !== "function") {
          return apiRejection("generatorFunction must be a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      var spawn = new PromiseSpawn(generatorFunction, this);
      var ret = spawn.promise();
      spawn._run(Promise.spawn);
      return ret;
  };
  };

  var map = function(Promise,
                            PromiseArray,
                            apiRejection,
                            tryConvertToPromise,
                            INTERNAL,
                            debug) {
  var getDomain = Promise._getDomain;
  var util$1 = util;
  var tryCatch = util$1.tryCatch;
  var errorObj = util$1.errorObj;
  var async = Promise._async;

  function MappingPromiseArray(promises, fn, limit, _filter) {
      this.constructor$(promises);
      this._promise._captureStackTrace();
      var domain = getDomain();
      this._callback = domain === null ? fn : util$1.domainBind(domain, fn);
      this._preservedValues = _filter === INTERNAL
          ? new Array(this.length())
          : null;
      this._limit = limit;
      this._inFlight = 0;
      this._queue = [];
      async.invoke(this._asyncInit, this, undefined);
  }
  util$1.inherits(MappingPromiseArray, PromiseArray);

  MappingPromiseArray.prototype._asyncInit = function() {
      this._init$(undefined, -2);
  };

  MappingPromiseArray.prototype._init = function () {};

  MappingPromiseArray.prototype._promiseFulfilled = function (value, index) {
      var values = this._values;
      var length = this.length();
      var preservedValues = this._preservedValues;
      var limit = this._limit;

      if (index < 0) {
          index = (index * -1) - 1;
          values[index] = value;
          if (limit >= 1) {
              this._inFlight--;
              this._drainQueue();
              if (this._isResolved()) return true;
          }
      } else {
          if (limit >= 1 && this._inFlight >= limit) {
              values[index] = value;
              this._queue.push(index);
              return false;
          }
          if (preservedValues !== null) preservedValues[index] = value;

          var promise = this._promise;
          var callback = this._callback;
          var receiver = promise._boundValue();
          promise._pushContext();
          var ret = tryCatch(callback).call(receiver, value, index, length);
          var promiseCreated = promise._popContext();
          debug.checkForgottenReturns(
              ret,
              promiseCreated,
              preservedValues !== null ? "Promise.filter" : "Promise.map",
              promise
          );
          if (ret === errorObj) {
              this._reject(ret.e);
              return true;
          }

          var maybePromise = tryConvertToPromise(ret, this._promise);
          if (maybePromise instanceof Promise) {
              maybePromise = maybePromise._target();
              var bitField = maybePromise._bitField;
              if (((bitField & 50397184) === 0)) {
                  if (limit >= 1) this._inFlight++;
                  values[index] = maybePromise;
                  maybePromise._proxy(this, (index + 1) * -1);
                  return false;
              } else if (((bitField & 33554432) !== 0)) {
                  ret = maybePromise._value();
              } else if (((bitField & 16777216) !== 0)) {
                  this._reject(maybePromise._reason());
                  return true;
              } else {
                  this._cancel();
                  return true;
              }
          }
          values[index] = ret;
      }
      var totalResolved = ++this._totalResolved;
      if (totalResolved >= length) {
          if (preservedValues !== null) {
              this._filter(values, preservedValues);
          } else {
              this._resolve(values);
          }
          return true;
      }
      return false;
  };

  MappingPromiseArray.prototype._drainQueue = function () {
      var queue = this._queue;
      var limit = this._limit;
      var values = this._values;
      while (queue.length > 0 && this._inFlight < limit) {
          if (this._isResolved()) return;
          var index = queue.pop();
          this._promiseFulfilled(values[index], index);
      }
  };

  MappingPromiseArray.prototype._filter = function (booleans, values) {
      var len = values.length;
      var ret = new Array(len);
      var j = 0;
      for (var i = 0; i < len; ++i) {
          if (booleans[i]) ret[j++] = values[i];
      }
      ret.length = j;
      this._resolve(ret);
  };

  MappingPromiseArray.prototype.preservedValues = function () {
      return this._preservedValues;
  };

  function map(promises, fn, options, _filter) {
      if (typeof fn !== "function") {
          return apiRejection("expecting a function but got " + util$1.classString(fn));
      }

      var limit = 0;
      if (options !== undefined) {
          if (typeof options === "object" && options !== null) {
              if (typeof options.concurrency !== "number") {
                  return Promise.reject(
                      new TypeError("'concurrency' must be a number but it is " +
                                      util$1.classString(options.concurrency)));
              }
              limit = options.concurrency;
          } else {
              return Promise.reject(new TypeError(
                              "options argument must be an object but it is " +
                               util$1.classString(options)));
          }
      }
      limit = typeof limit === "number" &&
          isFinite(limit) && limit >= 1 ? limit : 0;
      return new MappingPromiseArray(promises, fn, limit, _filter).promise();
  }

  Promise.prototype.map = function (fn, options) {
      return map(this, fn, options, null);
  };

  Promise.map = function (promises, fn, options, _filter) {
      return map(promises, fn, options, _filter);
  };


  };

  var nodeify = function(Promise) {
  var util$1 = util;
  var async = Promise._async;
  var tryCatch = util$1.tryCatch;
  var errorObj = util$1.errorObj;

  function spreadAdapter(val, nodeback) {
      var promise = this;
      if (!util$1.isArray(val)) return successAdapter.call(promise, val, nodeback);
      var ret =
          tryCatch(nodeback).apply(promise._boundValue(), [null].concat(val));
      if (ret === errorObj) {
          async.throwLater(ret.e);
      }
  }

  function successAdapter(val, nodeback) {
      var promise = this;
      var receiver = promise._boundValue();
      var ret = val === undefined
          ? tryCatch(nodeback).call(receiver, null)
          : tryCatch(nodeback).call(receiver, null, val);
      if (ret === errorObj) {
          async.throwLater(ret.e);
      }
  }
  function errorAdapter(reason, nodeback) {
      var promise = this;
      if (!reason) {
          var newReason = new Error(reason + "");
          newReason.cause = reason;
          reason = newReason;
      }
      var ret = tryCatch(nodeback).call(promise._boundValue(), reason);
      if (ret === errorObj) {
          async.throwLater(ret.e);
      }
  }

  Promise.prototype.asCallback = Promise.prototype.nodeify = function (nodeback,
                                                                       options) {
      if (typeof nodeback == "function") {
          var adapter = successAdapter;
          if (options !== undefined && Object(options).spread) {
              adapter = spreadAdapter;
          }
          this._then(
              adapter,
              errorAdapter,
              undefined,
              this,
              nodeback
          );
      }
      return this;
  };
  };

  var promisify = function(Promise, INTERNAL) {
  var THIS = {};
  var util$1 = util;
  var nodebackForPromise = nodeback;
  var withAppended = util$1.withAppended;
  var maybeWrapAsError = util$1.maybeWrapAsError;
  var canEvaluate = util$1.canEvaluate;
  var TypeError = errors.TypeError;
  var defaultSuffix = "Async";
  var defaultPromisified = {__isPromisified__: true};
  var noCopyProps = [
      "arity",    "length",
      "name",
      "arguments",
      "caller",
      "callee",
      "prototype",
      "__isPromisified__"
  ];
  var noCopyPropsPattern = new RegExp("^(?:" + noCopyProps.join("|") + ")$");

  var defaultFilter = function(name) {
      return util$1.isIdentifier(name) &&
          name.charAt(0) !== "_" &&
          name !== "constructor";
  };

  function propsFilter(key) {
      return !noCopyPropsPattern.test(key);
  }

  function isPromisified(fn) {
      try {
          return fn.__isPromisified__ === true;
      }
      catch (e) {
          return false;
      }
  }

  function hasPromisified(obj, key, suffix) {
      var val = util$1.getDataPropertyOrDefault(obj, key + suffix,
                                              defaultPromisified);
      return val ? isPromisified(val) : false;
  }
  function checkValid(ret, suffix, suffixRegexp) {
      for (var i = 0; i < ret.length; i += 2) {
          var key = ret[i];
          if (suffixRegexp.test(key)) {
              var keyWithoutAsyncSuffix = key.replace(suffixRegexp, "");
              for (var j = 0; j < ret.length; j += 2) {
                  if (ret[j] === keyWithoutAsyncSuffix) {
                      throw new TypeError("Cannot promisify an API that has normal methods with '%s'-suffix\u000a\u000a    See http://goo.gl/MqrFmX\u000a"
                          .replace("%s", suffix));
                  }
              }
          }
      }
  }

  function promisifiableMethods(obj, suffix, suffixRegexp, filter) {
      var keys = util$1.inheritedDataKeys(obj);
      var ret = [];
      for (var i = 0; i < keys.length; ++i) {
          var key = keys[i];
          var value = obj[key];
          var passesDefaultFilter = filter === defaultFilter
              ? true : defaultFilter(key);
          if (typeof value === "function" &&
              !isPromisified(value) &&
              !hasPromisified(obj, key, suffix) &&
              filter(key, value, obj, passesDefaultFilter)) {
              ret.push(key, value);
          }
      }
      checkValid(ret, suffix, suffixRegexp);
      return ret;
  }

  var escapeIdentRegex = function(str) {
      return str.replace(/([$])/, "\\$");
  };

  var makeNodePromisifiedEval;
  {
  var switchCaseArgumentOrder = function(likelyArgumentCount) {
      var ret = [likelyArgumentCount];
      var min = Math.max(0, likelyArgumentCount - 1 - 3);
      for(var i = likelyArgumentCount - 1; i >= min; --i) {
          ret.push(i);
      }
      for(var i = likelyArgumentCount + 1; i <= 3; ++i) {
          ret.push(i);
      }
      return ret;
  };

  var argumentSequence = function(argumentCount) {
      return util$1.filledRange(argumentCount, "_arg", "");
  };

  var parameterDeclaration = function(parameterCount) {
      return util$1.filledRange(
          Math.max(parameterCount, 3), "_arg", "");
  };

  var parameterCount = function(fn) {
      if (typeof fn.length === "number") {
          return Math.max(Math.min(fn.length, 1023 + 1), 0);
      }
      return 0;
  };

  makeNodePromisifiedEval =
  function(callback, receiver, originalName, fn, _, multiArgs) {
      var newParameterCount = Math.max(0, parameterCount(fn) - 1);
      var argumentOrder = switchCaseArgumentOrder(newParameterCount);
      var shouldProxyThis = typeof callback === "string" || receiver === THIS;

      function generateCallForArgumentCount(count) {
          var args = argumentSequence(count).join(", ");
          var comma = count > 0 ? ", " : "";
          var ret;
          if (shouldProxyThis) {
              ret = "ret = callback.call(this, {{args}}, nodeback); break;\n";
          } else {
              ret = receiver === undefined
                  ? "ret = callback({{args}}, nodeback); break;\n"
                  : "ret = callback.call(receiver, {{args}}, nodeback); break;\n";
          }
          return ret.replace("{{args}}", args).replace(", ", comma);
      }

      function generateArgumentSwitchCase() {
          var ret = "";
          for (var i = 0; i < argumentOrder.length; ++i) {
              ret += "case " + argumentOrder[i] +":" +
                  generateCallForArgumentCount(argumentOrder[i]);
          }

          ret += "                                                             \n\
        default:                                                             \n\
            var args = new Array(len + 1);                                   \n\
            var i = 0;                                                       \n\
            for (var i = 0; i < len; ++i) {                                  \n\
               args[i] = arguments[i];                                       \n\
            }                                                                \n\
            args[i] = nodeback;                                              \n\
            [CodeForCall]                                                    \n\
            break;                                                           \n\
        ".replace("[CodeForCall]", (shouldProxyThis
                                  ? "ret = callback.apply(this, args);\n"
                                  : "ret = callback.apply(receiver, args);\n"));
          return ret;
      }

      var getFunctionCode = typeof callback === "string"
                                  ? ("this != null ? this['"+callback+"'] : fn")
                                  : "fn";
      var body = "'use strict';                                                \n\
        var ret = function (Parameters) {                                    \n\
            'use strict';                                                    \n\
            var len = arguments.length;                                      \n\
            var promise = new Promise(INTERNAL);                             \n\
            promise._captureStackTrace();                                    \n\
            var nodeback = nodebackForPromise(promise, " + multiArgs + ");   \n\
            var ret;                                                         \n\
            var callback = tryCatch([GetFunctionCode]);                      \n\
            switch(len) {                                                    \n\
                [CodeForSwitchCase]                                          \n\
            }                                                                \n\
            if (ret === errorObj) {                                          \n\
                promise._rejectCallback(maybeWrapAsError(ret.e), true, true);\n\
            }                                                                \n\
            if (!promise._isFateSealed()) promise._setAsyncGuaranteed();     \n\
            return promise;                                                  \n\
        };                                                                   \n\
        notEnumerableProp(ret, '__isPromisified__', true);                   \n\
        return ret;                                                          \n\
    ".replace("[CodeForSwitchCase]", generateArgumentSwitchCase())
          .replace("[GetFunctionCode]", getFunctionCode);
      body = body.replace("Parameters", parameterDeclaration(newParameterCount));
      return new Function("Promise",
                          "fn",
                          "receiver",
                          "withAppended",
                          "maybeWrapAsError",
                          "nodebackForPromise",
                          "tryCatch",
                          "errorObj",
                          "notEnumerableProp",
                          "INTERNAL",
                          body)(
                      Promise,
                      fn,
                      receiver,
                      withAppended,
                      maybeWrapAsError,
                      nodebackForPromise,
                      util$1.tryCatch,
                      util$1.errorObj,
                      util$1.notEnumerableProp,
                      INTERNAL);
  };
  }

  function makeNodePromisifiedClosure(callback, receiver, _, fn, __, multiArgs) {
      var defaultThis = (function() {return this;})();
      var method = callback;
      if (typeof method === "string") {
          callback = fn;
      }
      function promisified() {
          var _receiver = receiver;
          if (receiver === THIS) _receiver = this;
          var promise = new Promise(INTERNAL);
          promise._captureStackTrace();
          var cb = typeof method === "string" && this !== defaultThis
              ? this[method] : callback;
          var fn = nodebackForPromise(promise, multiArgs);
          try {
              cb.apply(_receiver, withAppended(arguments, fn));
          } catch(e) {
              promise._rejectCallback(maybeWrapAsError(e), true, true);
          }
          if (!promise._isFateSealed()) promise._setAsyncGuaranteed();
          return promise;
      }
      util$1.notEnumerableProp(promisified, "__isPromisified__", true);
      return promisified;
  }

  var makeNodePromisified = canEvaluate
      ? makeNodePromisifiedEval
      : makeNodePromisifiedClosure;

  function promisifyAll(obj, suffix, filter, promisifier, multiArgs) {
      var suffixRegexp = new RegExp(escapeIdentRegex(suffix) + "$");
      var methods =
          promisifiableMethods(obj, suffix, suffixRegexp, filter);

      for (var i = 0, len = methods.length; i < len; i+= 2) {
          var key = methods[i];
          var fn = methods[i+1];
          var promisifiedKey = key + suffix;
          if (promisifier === makeNodePromisified) {
              obj[promisifiedKey] =
                  makeNodePromisified(key, THIS, key, fn, suffix, multiArgs);
          } else {
              var promisified = promisifier(fn, function() {
                  return makeNodePromisified(key, THIS, key,
                                             fn, suffix, multiArgs);
              });
              util$1.notEnumerableProp(promisified, "__isPromisified__", true);
              obj[promisifiedKey] = promisified;
          }
      }
      util$1.toFastProperties(obj);
      return obj;
  }

  function promisify(callback, receiver, multiArgs) {
      return makeNodePromisified(callback, receiver, undefined,
                                  callback, null, multiArgs);
  }

  Promise.promisify = function (fn, options) {
      if (typeof fn !== "function") {
          throw new TypeError("expecting a function but got " + util$1.classString(fn));
      }
      if (isPromisified(fn)) {
          return fn;
      }
      options = Object(options);
      var receiver = options.context === undefined ? THIS : options.context;
      var multiArgs = !!options.multiArgs;
      var ret = promisify(fn, receiver, multiArgs);
      util$1.copyDescriptors(fn, ret, propsFilter);
      return ret;
  };

  Promise.promisifyAll = function (target, options) {
      if (typeof target !== "function" && typeof target !== "object") {
          throw new TypeError("the target of promisifyAll must be an object or a function\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      options = Object(options);
      var multiArgs = !!options.multiArgs;
      var suffix = options.suffix;
      if (typeof suffix !== "string") suffix = defaultSuffix;
      var filter = options.filter;
      if (typeof filter !== "function") filter = defaultFilter;
      var promisifier = options.promisifier;
      if (typeof promisifier !== "function") promisifier = makeNodePromisified;

      if (!util$1.isIdentifier(suffix)) {
          throw new RangeError("suffix must be a valid identifier\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }

      var keys = util$1.inheritedDataKeys(target);
      for (var i = 0; i < keys.length; ++i) {
          var value = target[keys[i]];
          if (keys[i] !== "constructor" &&
              util$1.isClass(value)) {
              promisifyAll(value.prototype, suffix, filter, promisifier,
                  multiArgs);
              promisifyAll(value, suffix, filter, promisifier, multiArgs);
          }
      }

      return promisifyAll(target, suffix, filter, promisifier, multiArgs);
  };
  };

  var props = function(
      Promise, PromiseArray, tryConvertToPromise, apiRejection) {
  var util$1 = util;
  var isObject = util$1.isObject;
  var es5$1 = es5;
  var Es6Map;
  if (typeof Map === "function") Es6Map = Map;

  var mapToEntries = (function() {
      var index = 0;
      var size = 0;

      function extractEntry(value, key) {
          this[index] = value;
          this[index + size] = key;
          index++;
      }

      return function mapToEntries(map) {
          size = map.size;
          index = 0;
          var ret = new Array(map.size * 2);
          map.forEach(extractEntry, ret);
          return ret;
      };
  })();

  var entriesToMap = function(entries) {
      var ret = new Es6Map();
      var length = entries.length / 2 | 0;
      for (var i = 0; i < length; ++i) {
          var key = entries[length + i];
          var value = entries[i];
          ret.set(key, value);
      }
      return ret;
  };

  function PropertiesPromiseArray(obj) {
      var isMap = false;
      var entries;
      if (Es6Map !== undefined && obj instanceof Es6Map) {
          entries = mapToEntries(obj);
          isMap = true;
      } else {
          var keys = es5$1.keys(obj);
          var len = keys.length;
          entries = new Array(len * 2);
          for (var i = 0; i < len; ++i) {
              var key = keys[i];
              entries[i] = obj[key];
              entries[i + len] = key;
          }
      }
      this.constructor$(entries);
      this._isMap = isMap;
      this._init$(undefined, isMap ? -6 : -3);
  }
  util$1.inherits(PropertiesPromiseArray, PromiseArray);

  PropertiesPromiseArray.prototype._init = function () {};

  PropertiesPromiseArray.prototype._promiseFulfilled = function (value, index) {
      this._values[index] = value;
      var totalResolved = ++this._totalResolved;
      if (totalResolved >= this._length) {
          var val;
          if (this._isMap) {
              val = entriesToMap(this._values);
          } else {
              val = {};
              var keyOffset = this.length();
              for (var i = 0, len = this.length(); i < len; ++i) {
                  val[this._values[i + keyOffset]] = this._values[i];
              }
          }
          this._resolve(val);
          return true;
      }
      return false;
  };

  PropertiesPromiseArray.prototype.shouldCopyValues = function () {
      return false;
  };

  PropertiesPromiseArray.prototype.getActualLength = function (len) {
      return len >> 1;
  };

  function props(promises) {
      var ret;
      var castValue = tryConvertToPromise(promises);

      if (!isObject(castValue)) {
          return apiRejection("cannot await properties of a non-object\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      } else if (castValue instanceof Promise) {
          ret = castValue._then(
              Promise.props, undefined, undefined, undefined, undefined);
      } else {
          ret = new PropertiesPromiseArray(castValue).promise();
      }

      if (castValue instanceof Promise) {
          ret._propagateFrom(castValue, 2);
      }
      return ret;
  }

  Promise.prototype.props = function () {
      return props(this);
  };

  Promise.props = function (promises) {
      return props(promises);
  };
  };

  var race = function(
      Promise, INTERNAL, tryConvertToPromise, apiRejection) {
  var util$1 = util;

  var raceLater = function (promise) {
      return promise.then(function(array) {
          return race(array, promise);
      });
  };

  function race(promises, parent) {
      var maybePromise = tryConvertToPromise(promises);

      if (maybePromise instanceof Promise) {
          return raceLater(maybePromise);
      } else {
          promises = util$1.asArray(promises);
          if (promises === null)
              return apiRejection("expecting an array or an iterable object but got " + util$1.classString(promises));
      }

      var ret = new Promise(INTERNAL);
      if (parent !== undefined) {
          ret._propagateFrom(parent, 3);
      }
      var fulfill = ret._fulfill;
      var reject = ret._reject;
      for (var i = 0, len = promises.length; i < len; ++i) {
          var val = promises[i];

          if (val === undefined && !(i in promises)) {
              continue;
          }

          Promise.cast(val)._then(fulfill, reject, undefined, ret, null);
      }
      return ret;
  }

  Promise.race = function (promises) {
      return race(promises, undefined);
  };

  Promise.prototype.race = function () {
      return race(this, undefined);
  };

  };

  var reduce = function(Promise,
                            PromiseArray,
                            apiRejection,
                            tryConvertToPromise,
                            INTERNAL,
                            debug) {
  var getDomain = Promise._getDomain;
  var util$1 = util;
  var tryCatch = util$1.tryCatch;

  function ReductionPromiseArray(promises, fn, initialValue, _each) {
      this.constructor$(promises);
      var domain = getDomain();
      this._fn = domain === null ? fn : util$1.domainBind(domain, fn);
      if (initialValue !== undefined) {
          initialValue = Promise.resolve(initialValue);
          initialValue._attachCancellationCallback(this);
      }
      this._initialValue = initialValue;
      this._currentCancellable = null;
      if(_each === INTERNAL) {
          this._eachValues = Array(this._length);
      } else if (_each === 0) {
          this._eachValues = null;
      } else {
          this._eachValues = undefined;
      }
      this._promise._captureStackTrace();
      this._init$(undefined, -5);
  }
  util$1.inherits(ReductionPromiseArray, PromiseArray);

  ReductionPromiseArray.prototype._gotAccum = function(accum) {
      if (this._eachValues !== undefined && 
          this._eachValues !== null && 
          accum !== INTERNAL) {
          this._eachValues.push(accum);
      }
  };

  ReductionPromiseArray.prototype._eachComplete = function(value) {
      if (this._eachValues !== null) {
          this._eachValues.push(value);
      }
      return this._eachValues;
  };

  ReductionPromiseArray.prototype._init = function() {};

  ReductionPromiseArray.prototype._resolveEmptyArray = function() {
      this._resolve(this._eachValues !== undefined ? this._eachValues
                                                   : this._initialValue);
  };

  ReductionPromiseArray.prototype.shouldCopyValues = function () {
      return false;
  };

  ReductionPromiseArray.prototype._resolve = function(value) {
      this._promise._resolveCallback(value);
      this._values = null;
  };

  ReductionPromiseArray.prototype._resultCancelled = function(sender) {
      if (sender === this._initialValue) return this._cancel();
      if (this._isResolved()) return;
      this._resultCancelled$();
      if (this._currentCancellable instanceof Promise) {
          this._currentCancellable.cancel();
      }
      if (this._initialValue instanceof Promise) {
          this._initialValue.cancel();
      }
  };

  ReductionPromiseArray.prototype._iterate = function (values) {
      this._values = values;
      var value;
      var i;
      var length = values.length;
      if (this._initialValue !== undefined) {
          value = this._initialValue;
          i = 0;
      } else {
          value = Promise.resolve(values[0]);
          i = 1;
      }

      this._currentCancellable = value;

      if (!value.isRejected()) {
          for (; i < length; ++i) {
              var ctx = {
                  accum: null,
                  value: values[i],
                  index: i,
                  length: length,
                  array: this
              };
              value = value._then(gotAccum, undefined, undefined, ctx, undefined);
          }
      }

      if (this._eachValues !== undefined) {
          value = value
              ._then(this._eachComplete, undefined, undefined, this, undefined);
      }
      value._then(completed, completed, undefined, value, this);
  };

  Promise.prototype.reduce = function (fn, initialValue) {
      return reduce(this, fn, initialValue, null);
  };

  Promise.reduce = function (promises, fn, initialValue, _each) {
      return reduce(promises, fn, initialValue, _each);
  };

  function completed(valueOrReason, array) {
      if (this.isFulfilled()) {
          array._resolve(valueOrReason);
      } else {
          array._reject(valueOrReason);
      }
  }

  function reduce(promises, fn, initialValue, _each) {
      if (typeof fn !== "function") {
          return apiRejection("expecting a function but got " + util$1.classString(fn));
      }
      var array = new ReductionPromiseArray(promises, fn, initialValue, _each);
      return array.promise();
  }

  function gotAccum(accum) {
      this.accum = accum;
      this.array._gotAccum(accum);
      var value = tryConvertToPromise(this.value, this.array._promise);
      if (value instanceof Promise) {
          this.array._currentCancellable = value;
          return value._then(gotValue, undefined, undefined, this, undefined);
      } else {
          return gotValue.call(this, value);
      }
  }

  function gotValue(value) {
      var array = this.array;
      var promise = array._promise;
      var fn = tryCatch(array._fn);
      promise._pushContext();
      var ret;
      if (array._eachValues !== undefined) {
          ret = fn.call(promise._boundValue(), value, this.index, this.length);
      } else {
          ret = fn.call(promise._boundValue(),
                                this.accum, value, this.index, this.length);
      }
      if (ret instanceof Promise) {
          array._currentCancellable = ret;
      }
      var promiseCreated = promise._popContext();
      debug.checkForgottenReturns(
          ret,
          promiseCreated,
          array._eachValues !== undefined ? "Promise.each" : "Promise.reduce",
          promise
      );
      return ret;
  }
  };

  var settle =
      function(Promise, PromiseArray, debug) {
  var PromiseInspection = Promise.PromiseInspection;
  var util$1 = util;

  function SettledPromiseArray(values) {
      this.constructor$(values);
  }
  util$1.inherits(SettledPromiseArray, PromiseArray);

  SettledPromiseArray.prototype._promiseResolved = function (index, inspection) {
      this._values[index] = inspection;
      var totalResolved = ++this._totalResolved;
      if (totalResolved >= this._length) {
          this._resolve(this._values);
          return true;
      }
      return false;
  };

  SettledPromiseArray.prototype._promiseFulfilled = function (value, index) {
      var ret = new PromiseInspection();
      ret._bitField = 33554432;
      ret._settledValueField = value;
      return this._promiseResolved(index, ret);
  };
  SettledPromiseArray.prototype._promiseRejected = function (reason, index) {
      var ret = new PromiseInspection();
      ret._bitField = 16777216;
      ret._settledValueField = reason;
      return this._promiseResolved(index, ret);
  };

  Promise.settle = function (promises) {
      debug.deprecated(".settle()", ".reflect()");
      return new SettledPromiseArray(promises).promise();
  };

  Promise.prototype.settle = function () {
      return Promise.settle(this);
  };
  };

  var some =
  function(Promise, PromiseArray, apiRejection) {
  var util$1 = util;
  var RangeError = errors.RangeError;
  var AggregateError = errors.AggregateError;
  var isArray = util$1.isArray;
  var CANCELLATION = {};


  function SomePromiseArray(values) {
      this.constructor$(values);
      this._howMany = 0;
      this._unwrap = false;
      this._initialized = false;
  }
  util$1.inherits(SomePromiseArray, PromiseArray);

  SomePromiseArray.prototype._init = function () {
      if (!this._initialized) {
          return;
      }
      if (this._howMany === 0) {
          this._resolve([]);
          return;
      }
      this._init$(undefined, -5);
      var isArrayResolved = isArray(this._values);
      if (!this._isResolved() &&
          isArrayResolved &&
          this._howMany > this._canPossiblyFulfill()) {
          this._reject(this._getRangeError(this.length()));
      }
  };

  SomePromiseArray.prototype.init = function () {
      this._initialized = true;
      this._init();
  };

  SomePromiseArray.prototype.setUnwrap = function () {
      this._unwrap = true;
  };

  SomePromiseArray.prototype.howMany = function () {
      return this._howMany;
  };

  SomePromiseArray.prototype.setHowMany = function (count) {
      this._howMany = count;
  };

  SomePromiseArray.prototype._promiseFulfilled = function (value) {
      this._addFulfilled(value);
      if (this._fulfilled() === this.howMany()) {
          this._values.length = this.howMany();
          if (this.howMany() === 1 && this._unwrap) {
              this._resolve(this._values[0]);
          } else {
              this._resolve(this._values);
          }
          return true;
      }
      return false;

  };
  SomePromiseArray.prototype._promiseRejected = function (reason) {
      this._addRejected(reason);
      return this._checkOutcome();
  };

  SomePromiseArray.prototype._promiseCancelled = function () {
      if (this._values instanceof Promise || this._values == null) {
          return this._cancel();
      }
      this._addRejected(CANCELLATION);
      return this._checkOutcome();
  };

  SomePromiseArray.prototype._checkOutcome = function() {
      if (this.howMany() > this._canPossiblyFulfill()) {
          var e = new AggregateError();
          for (var i = this.length(); i < this._values.length; ++i) {
              if (this._values[i] !== CANCELLATION) {
                  e.push(this._values[i]);
              }
          }
          if (e.length > 0) {
              this._reject(e);
          } else {
              this._cancel();
          }
          return true;
      }
      return false;
  };

  SomePromiseArray.prototype._fulfilled = function () {
      return this._totalResolved;
  };

  SomePromiseArray.prototype._rejected = function () {
      return this._values.length - this.length();
  };

  SomePromiseArray.prototype._addRejected = function (reason) {
      this._values.push(reason);
  };

  SomePromiseArray.prototype._addFulfilled = function (value) {
      this._values[this._totalResolved++] = value;
  };

  SomePromiseArray.prototype._canPossiblyFulfill = function () {
      return this.length() - this._rejected();
  };

  SomePromiseArray.prototype._getRangeError = function (count) {
      var message = "Input array must contain at least " +
              this._howMany + " items but contains only " + count + " items";
      return new RangeError(message);
  };

  SomePromiseArray.prototype._resolveEmptyArray = function () {
      this._reject(this._getRangeError(0));
  };

  function some(promises, howMany) {
      if ((howMany | 0) !== howMany || howMany < 0) {
          return apiRejection("expecting a positive integer\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      var ret = new SomePromiseArray(promises);
      var promise = ret.promise();
      ret.setHowMany(howMany);
      ret.init();
      return promise;
  }

  Promise.some = function (promises, howMany) {
      return some(promises, howMany);
  };

  Promise.prototype.some = function (howMany) {
      return some(this, howMany);
  };

  Promise._SomePromiseArray = SomePromiseArray;
  };

  var timers = function(Promise, INTERNAL, debug) {
  var util$1 = util;
  var TimeoutError = Promise.TimeoutError;

  function HandleWrapper(handle)  {
      this.handle = handle;
  }

  HandleWrapper.prototype._resultCancelled = function() {
      clearTimeout(this.handle);
  };

  var afterValue = function(value) { return delay(+this).thenReturn(value); };
  var delay = Promise.delay = function (ms, value) {
      var ret;
      var handle;
      if (value !== undefined) {
          ret = Promise.resolve(value)
                  ._then(afterValue, null, null, ms, undefined);
          if (debug.cancellation() && value instanceof Promise) {
              ret._setOnCancel(value);
          }
      } else {
          ret = new Promise(INTERNAL);
          handle = setTimeout(function() { ret._fulfill(); }, +ms);
          if (debug.cancellation()) {
              ret._setOnCancel(new HandleWrapper(handle));
          }
          ret._captureStackTrace();
      }
      ret._setAsyncGuaranteed();
      return ret;
  };

  Promise.prototype.delay = function (ms) {
      return delay(ms, this);
  };

  var afterTimeout = function (promise, message, parent) {
      var err;
      if (typeof message !== "string") {
          if (message instanceof Error) {
              err = message;
          } else {
              err = new TimeoutError("operation timed out");
          }
      } else {
          err = new TimeoutError(message);
      }
      util$1.markAsOriginatingFromRejection(err);
      promise._attachExtraTrace(err);
      promise._reject(err);

      if (parent != null) {
          parent.cancel();
      }
  };

  function successClear(value) {
      clearTimeout(this.handle);
      return value;
  }

  function failureClear(reason) {
      clearTimeout(this.handle);
      throw reason;
  }

  Promise.prototype.timeout = function (ms, message) {
      ms = +ms;
      var ret, parent;

      var handleWrapper = new HandleWrapper(setTimeout(function timeoutTimeout() {
          if (ret.isPending()) {
              afterTimeout(ret, message, parent);
          }
      }, ms));

      if (debug.cancellation()) {
          parent = this.then();
          ret = parent._then(successClear, failureClear,
                              undefined, handleWrapper, undefined);
          ret._setOnCancel(handleWrapper);
      } else {
          ret = this._then(successClear, failureClear,
                              undefined, handleWrapper, undefined);
      }

      return ret;
  };

  };

  var using = function (Promise, apiRejection, tryConvertToPromise,
      createContext, INTERNAL, debug) {
      var util$1 = util;
      var TypeError = errors.TypeError;
      var inherits = util.inherits;
      var errorObj = util$1.errorObj;
      var tryCatch = util$1.tryCatch;
      var NULL = {};

      function thrower(e) {
          setTimeout(function(){throw e;}, 0);
      }

      function castPreservingDisposable(thenable) {
          var maybePromise = tryConvertToPromise(thenable);
          if (maybePromise !== thenable &&
              typeof thenable._isDisposable === "function" &&
              typeof thenable._getDisposer === "function" &&
              thenable._isDisposable()) {
              maybePromise._setDisposable(thenable._getDisposer());
          }
          return maybePromise;
      }
      function dispose(resources, inspection) {
          var i = 0;
          var len = resources.length;
          var ret = new Promise(INTERNAL);
          function iterator() {
              if (i >= len) return ret._fulfill();
              var maybePromise = castPreservingDisposable(resources[i++]);
              if (maybePromise instanceof Promise &&
                  maybePromise._isDisposable()) {
                  try {
                      maybePromise = tryConvertToPromise(
                          maybePromise._getDisposer().tryDispose(inspection),
                          resources.promise);
                  } catch (e) {
                      return thrower(e);
                  }
                  if (maybePromise instanceof Promise) {
                      return maybePromise._then(iterator, thrower,
                                                null, null, null);
                  }
              }
              iterator();
          }
          iterator();
          return ret;
      }

      function Disposer(data, promise, context) {
          this._data = data;
          this._promise = promise;
          this._context = context;
      }

      Disposer.prototype.data = function () {
          return this._data;
      };

      Disposer.prototype.promise = function () {
          return this._promise;
      };

      Disposer.prototype.resource = function () {
          if (this.promise().isFulfilled()) {
              return this.promise().value();
          }
          return NULL;
      };

      Disposer.prototype.tryDispose = function(inspection) {
          var resource = this.resource();
          var context = this._context;
          if (context !== undefined) context._pushContext();
          var ret = resource !== NULL
              ? this.doDispose(resource, inspection) : null;
          if (context !== undefined) context._popContext();
          this._promise._unsetDisposable();
          this._data = null;
          return ret;
      };

      Disposer.isDisposer = function (d) {
          return (d != null &&
                  typeof d.resource === "function" &&
                  typeof d.tryDispose === "function");
      };

      function FunctionDisposer(fn, promise, context) {
          this.constructor$(fn, promise, context);
      }
      inherits(FunctionDisposer, Disposer);

      FunctionDisposer.prototype.doDispose = function (resource, inspection) {
          var fn = this.data();
          return fn.call(resource, resource, inspection);
      };

      function maybeUnwrapDisposer(value) {
          if (Disposer.isDisposer(value)) {
              this.resources[this.index]._setDisposable(value);
              return value.promise();
          }
          return value;
      }

      function ResourceList(length) {
          this.length = length;
          this.promise = null;
          this[length-1] = null;
      }

      ResourceList.prototype._resultCancelled = function() {
          var len = this.length;
          for (var i = 0; i < len; ++i) {
              var item = this[i];
              if (item instanceof Promise) {
                  item.cancel();
              }
          }
      };

      Promise.using = function () {
          var len = arguments.length;
          if (len < 2) return apiRejection(
                          "you must pass at least 2 arguments to Promise.using");
          var fn = arguments[len - 1];
          if (typeof fn !== "function") {
              return apiRejection("expecting a function but got " + util$1.classString(fn));
          }
          var input;
          var spreadArgs = true;
          if (len === 2 && Array.isArray(arguments[0])) {
              input = arguments[0];
              len = input.length;
              spreadArgs = false;
          } else {
              input = arguments;
              len--;
          }
          var resources = new ResourceList(len);
          for (var i = 0; i < len; ++i) {
              var resource = input[i];
              if (Disposer.isDisposer(resource)) {
                  var disposer = resource;
                  resource = resource.promise();
                  resource._setDisposable(disposer);
              } else {
                  var maybePromise = tryConvertToPromise(resource);
                  if (maybePromise instanceof Promise) {
                      resource =
                          maybePromise._then(maybeUnwrapDisposer, null, null, {
                              resources: resources,
                              index: i
                      }, undefined);
                  }
              }
              resources[i] = resource;
          }

          var reflectedResources = new Array(resources.length);
          for (var i = 0; i < reflectedResources.length; ++i) {
              reflectedResources[i] = Promise.resolve(resources[i]).reflect();
          }

          var resultPromise = Promise.all(reflectedResources)
              .then(function(inspections) {
                  for (var i = 0; i < inspections.length; ++i) {
                      var inspection = inspections[i];
                      if (inspection.isRejected()) {
                          errorObj.e = inspection.error();
                          return errorObj;
                      } else if (!inspection.isFulfilled()) {
                          resultPromise.cancel();
                          return;
                      }
                      inspections[i] = inspection.value();
                  }
                  promise._pushContext();

                  fn = tryCatch(fn);
                  var ret = spreadArgs
                      ? fn.apply(undefined, inspections) : fn(inspections);
                  var promiseCreated = promise._popContext();
                  debug.checkForgottenReturns(
                      ret, promiseCreated, "Promise.using", promise);
                  return ret;
              });

          var promise = resultPromise.lastly(function() {
              var inspection = new Promise.PromiseInspection(resultPromise);
              return dispose(resources, inspection);
          });
          resources.promise = promise;
          promise._setOnCancel(resources);
          return promise;
      };

      Promise.prototype._setDisposable = function (disposer) {
          this._bitField = this._bitField | 131072;
          this._disposer = disposer;
      };

      Promise.prototype._isDisposable = function () {
          return (this._bitField & 131072) > 0;
      };

      Promise.prototype._getDisposer = function () {
          return this._disposer;
      };

      Promise.prototype._unsetDisposable = function () {
          this._bitField = this._bitField & (~131072);
          this._disposer = undefined;
      };

      Promise.prototype.disposer = function (fn) {
          if (typeof fn === "function") {
              return new FunctionDisposer(fn, this, createContext());
          }
          throw new TypeError();
      };

  };

  var any = function(Promise) {
  var SomePromiseArray = Promise._SomePromiseArray;
  function any(promises) {
      var ret = new SomePromiseArray(promises);
      var promise = ret.promise();
      ret.setHowMany(1);
      ret.setUnwrap();
      ret.init();
      return promise;
  }

  Promise.any = function (promises) {
      return any(promises);
  };

  Promise.prototype.any = function () {
      return any(this);
  };

  };

  var each = function(Promise, INTERNAL) {
  var PromiseReduce = Promise.reduce;
  var PromiseAll = Promise.all;

  function promiseAllThis() {
      return PromiseAll(this);
  }

  function PromiseMapSeries(promises, fn) {
      return PromiseReduce(promises, fn, INTERNAL, INTERNAL);
  }

  Promise.prototype.each = function (fn) {
      return PromiseReduce(this, fn, INTERNAL, 0)
                ._then(promiseAllThis, undefined, undefined, this, undefined);
  };

  Promise.prototype.mapSeries = function (fn) {
      return PromiseReduce(this, fn, INTERNAL, INTERNAL);
  };

  Promise.each = function (promises, fn) {
      return PromiseReduce(promises, fn, INTERNAL, 0)
                ._then(promiseAllThis, undefined, undefined, promises, undefined);
  };

  Promise.mapSeries = PromiseMapSeries;
  };

  var filter = function(Promise, INTERNAL) {
  var PromiseMap = Promise.map;

  Promise.prototype.filter = function (fn, options) {
      return PromiseMap(this, fn, options, INTERNAL);
  };

  Promise.filter = function (promises, fn, options) {
      return PromiseMap(promises, fn, options, INTERNAL);
  };
  };

  var promise = createCommonjsModule(function (module) {
  module.exports = function() {
  var makeSelfResolutionError = function () {
      return new TypeError("circular promise resolution chain\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
  };
  var reflectHandler = function() {
      return new Promise.PromiseInspection(this._target());
  };
  var apiRejection = function(msg) {
      return Promise.reject(new TypeError(msg));
  };
  function Proxyable() {}
  var UNDEFINED_BINDING = {};
  var util$1 = util;

  var getDomain;
  if (util$1.isNode) {
      getDomain = function() {
          var ret = process.domain;
          if (ret === undefined) ret = null;
          return ret;
      };
  } else {
      getDomain = function() {
          return null;
      };
  }
  util$1.notEnumerableProp(Promise, "_getDomain", getDomain);

  var es5$1 = es5;
  var Async = async;
  var async$1 = new Async();
  es5$1.defineProperty(Promise, "_async", {value: async$1});
  var errors$1 = errors;
  var TypeError = Promise.TypeError = errors$1.TypeError;
  Promise.RangeError = errors$1.RangeError;
  var CancellationError = Promise.CancellationError = errors$1.CancellationError;
  Promise.TimeoutError = errors$1.TimeoutError;
  Promise.OperationalError = errors$1.OperationalError;
  Promise.RejectionError = errors$1.OperationalError;
  Promise.AggregateError = errors$1.AggregateError;
  var INTERNAL = function(){};
  var APPLY = {};
  var NEXT_FILTER = {};
  var tryConvertToPromise = thenables(Promise, INTERNAL);
  var PromiseArray =
      promise_array(Promise, INTERNAL,
                                 tryConvertToPromise, apiRejection, Proxyable);
  var Context = context(Promise);
   /*jshint unused:false*/
  var createContext = Context.create;
  var debug = debuggability(Promise, Context);
  var PassThroughHandlerContext =
      _finally(Promise, tryConvertToPromise, NEXT_FILTER);
  var catchFilter = catch_filter(NEXT_FILTER);
  var nodebackForPromise = nodeback;
  var errorObj = util$1.errorObj;
  var tryCatch = util$1.tryCatch;
  function check(self, executor) {
      if (self == null || self.constructor !== Promise) {
          throw new TypeError("the promise constructor cannot be invoked directly\u000a\u000a    See http://goo.gl/MqrFmX\u000a");
      }
      if (typeof executor !== "function") {
          throw new TypeError("expecting a function but got " + util$1.classString(executor));
      }

  }

  function Promise(executor) {
      if (executor !== INTERNAL) {
          check(this, executor);
      }
      this._bitField = 0;
      this._fulfillmentHandler0 = undefined;
      this._rejectionHandler0 = undefined;
      this._promise0 = undefined;
      this._receiver0 = undefined;
      this._resolveFromExecutor(executor);
      this._promiseCreated();
      this._fireEvent("promiseCreated", this);
  }

  Promise.prototype.toString = function () {
      return "[object Promise]";
  };

  Promise.prototype.caught = Promise.prototype["catch"] = function (fn) {
      var len = arguments.length;
      if (len > 1) {
          var catchInstances = new Array(len - 1),
              j = 0, i;
          for (i = 0; i < len - 1; ++i) {
              var item = arguments[i];
              if (util$1.isObject(item)) {
                  catchInstances[j++] = item;
              } else {
                  return apiRejection("Catch statement predicate: " +
                      "expecting an object but got " + util$1.classString(item));
              }
          }
          catchInstances.length = j;
          fn = arguments[i];

          if (typeof fn !== "function") {
              throw new TypeError("The last argument to .catch() " +
                  "must be a function, got " + util$1.toString(fn));
          }
          return this.then(undefined, catchFilter(catchInstances, fn, this));
      }
      return this.then(undefined, fn);
  };

  Promise.prototype.reflect = function () {
      return this._then(reflectHandler,
          reflectHandler, undefined, this, undefined);
  };

  Promise.prototype.then = function (didFulfill, didReject) {
      if (debug.warnings() && arguments.length > 0 &&
          typeof didFulfill !== "function" &&
          typeof didReject !== "function") {
          var msg = ".then() only accepts functions but was passed: " +
                  util$1.classString(didFulfill);
          if (arguments.length > 1) {
              msg += ", " + util$1.classString(didReject);
          }
          this._warn(msg);
      }
      return this._then(didFulfill, didReject, undefined, undefined, undefined);
  };

  Promise.prototype.done = function (didFulfill, didReject) {
      var promise =
          this._then(didFulfill, didReject, undefined, undefined, undefined);
      promise._setIsFinal();
  };

  Promise.prototype.spread = function (fn) {
      if (typeof fn !== "function") {
          return apiRejection("expecting a function but got " + util$1.classString(fn));
      }
      return this.all()._then(fn, undefined, undefined, APPLY, undefined);
  };

  Promise.prototype.toJSON = function () {
      var ret = {
          isFulfilled: false,
          isRejected: false,
          fulfillmentValue: undefined,
          rejectionReason: undefined
      };
      if (this.isFulfilled()) {
          ret.fulfillmentValue = this.value();
          ret.isFulfilled = true;
      } else if (this.isRejected()) {
          ret.rejectionReason = this.reason();
          ret.isRejected = true;
      }
      return ret;
  };

  Promise.prototype.all = function () {
      if (arguments.length > 0) {
          this._warn(".all() was passed arguments but it does not take any");
      }
      return new PromiseArray(this).promise();
  };

  Promise.prototype.error = function (fn) {
      return this.caught(util$1.originatesFromRejection, fn);
  };

  Promise.getNewLibraryCopy = module.exports;

  Promise.is = function (val) {
      return val instanceof Promise;
  };

  Promise.fromNode = Promise.fromCallback = function(fn) {
      var ret = new Promise(INTERNAL);
      ret._captureStackTrace();
      var multiArgs = arguments.length > 1 ? !!Object(arguments[1]).multiArgs
                                           : false;
      var result = tryCatch(fn)(nodebackForPromise(ret, multiArgs));
      if (result === errorObj) {
          ret._rejectCallback(result.e, true);
      }
      if (!ret._isFateSealed()) ret._setAsyncGuaranteed();
      return ret;
  };

  Promise.all = function (promises) {
      return new PromiseArray(promises).promise();
  };

  Promise.cast = function (obj) {
      var ret = tryConvertToPromise(obj);
      if (!(ret instanceof Promise)) {
          ret = new Promise(INTERNAL);
          ret._captureStackTrace();
          ret._setFulfilled();
          ret._rejectionHandler0 = obj;
      }
      return ret;
  };

  Promise.resolve = Promise.fulfilled = Promise.cast;

  Promise.reject = Promise.rejected = function (reason) {
      var ret = new Promise(INTERNAL);
      ret._captureStackTrace();
      ret._rejectCallback(reason, true);
      return ret;
  };

  Promise.setScheduler = function(fn) {
      if (typeof fn !== "function") {
          throw new TypeError("expecting a function but got " + util$1.classString(fn));
      }
      return async$1.setScheduler(fn);
  };

  Promise.prototype._then = function (
      didFulfill,
      didReject,
      _,    receiver,
      internalData
  ) {
      var haveInternalData = internalData !== undefined;
      var promise = haveInternalData ? internalData : new Promise(INTERNAL);
      var target = this._target();
      var bitField = target._bitField;

      if (!haveInternalData) {
          promise._propagateFrom(this, 3);
          promise._captureStackTrace();
          if (receiver === undefined &&
              ((this._bitField & 2097152) !== 0)) {
              if (!((bitField & 50397184) === 0)) {
                  receiver = this._boundValue();
              } else {
                  receiver = target === this ? undefined : this._boundTo;
              }
          }
          this._fireEvent("promiseChained", this, promise);
      }

      var domain = getDomain();
      if (!((bitField & 50397184) === 0)) {
          var handler, value, settler = target._settlePromiseCtx;
          if (((bitField & 33554432) !== 0)) {
              value = target._rejectionHandler0;
              handler = didFulfill;
          } else if (((bitField & 16777216) !== 0)) {
              value = target._fulfillmentHandler0;
              handler = didReject;
              target._unsetRejectionIsUnhandled();
          } else {
              settler = target._settlePromiseLateCancellationObserver;
              value = new CancellationError("late cancellation observer");
              target._attachExtraTrace(value);
              handler = didReject;
          }

          async$1.invoke(settler, target, {
              handler: domain === null ? handler
                  : (typeof handler === "function" &&
                      util$1.domainBind(domain, handler)),
              promise: promise,
              receiver: receiver,
              value: value
          });
      } else {
          target._addCallbacks(didFulfill, didReject, promise, receiver, domain);
      }

      return promise;
  };

  Promise.prototype._length = function () {
      return this._bitField & 65535;
  };

  Promise.prototype._isFateSealed = function () {
      return (this._bitField & 117506048) !== 0;
  };

  Promise.prototype._isFollowing = function () {
      return (this._bitField & 67108864) === 67108864;
  };

  Promise.prototype._setLength = function (len) {
      this._bitField = (this._bitField & -65536) |
          (len & 65535);
  };

  Promise.prototype._setFulfilled = function () {
      this._bitField = this._bitField | 33554432;
      this._fireEvent("promiseFulfilled", this);
  };

  Promise.prototype._setRejected = function () {
      this._bitField = this._bitField | 16777216;
      this._fireEvent("promiseRejected", this);
  };

  Promise.prototype._setFollowing = function () {
      this._bitField = this._bitField | 67108864;
      this._fireEvent("promiseResolved", this);
  };

  Promise.prototype._setIsFinal = function () {
      this._bitField = this._bitField | 4194304;
  };

  Promise.prototype._isFinal = function () {
      return (this._bitField & 4194304) > 0;
  };

  Promise.prototype._unsetCancelled = function() {
      this._bitField = this._bitField & (~65536);
  };

  Promise.prototype._setCancelled = function() {
      this._bitField = this._bitField | 65536;
      this._fireEvent("promiseCancelled", this);
  };

  Promise.prototype._setWillBeCancelled = function() {
      this._bitField = this._bitField | 8388608;
  };

  Promise.prototype._setAsyncGuaranteed = function() {
      if (async$1.hasCustomScheduler()) return;
      this._bitField = this._bitField | 134217728;
  };

  Promise.prototype._receiverAt = function (index) {
      var ret = index === 0 ? this._receiver0 : this[
              index * 4 - 4 + 3];
      if (ret === UNDEFINED_BINDING) {
          return undefined;
      } else if (ret === undefined && this._isBound()) {
          return this._boundValue();
      }
      return ret;
  };

  Promise.prototype._promiseAt = function (index) {
      return this[
              index * 4 - 4 + 2];
  };

  Promise.prototype._fulfillmentHandlerAt = function (index) {
      return this[
              index * 4 - 4 + 0];
  };

  Promise.prototype._rejectionHandlerAt = function (index) {
      return this[
              index * 4 - 4 + 1];
  };

  Promise.prototype._boundValue = function() {};

  Promise.prototype._migrateCallback0 = function (follower) {
      var bitField = follower._bitField;
      var fulfill = follower._fulfillmentHandler0;
      var reject = follower._rejectionHandler0;
      var promise = follower._promise0;
      var receiver = follower._receiverAt(0);
      if (receiver === undefined) receiver = UNDEFINED_BINDING;
      this._addCallbacks(fulfill, reject, promise, receiver, null);
  };

  Promise.prototype._migrateCallbackAt = function (follower, index) {
      var fulfill = follower._fulfillmentHandlerAt(index);
      var reject = follower._rejectionHandlerAt(index);
      var promise = follower._promiseAt(index);
      var receiver = follower._receiverAt(index);
      if (receiver === undefined) receiver = UNDEFINED_BINDING;
      this._addCallbacks(fulfill, reject, promise, receiver, null);
  };

  Promise.prototype._addCallbacks = function (
      fulfill,
      reject,
      promise,
      receiver,
      domain
  ) {
      var index = this._length();

      if (index >= 65535 - 4) {
          index = 0;
          this._setLength(0);
      }

      if (index === 0) {
          this._promise0 = promise;
          this._receiver0 = receiver;
          if (typeof fulfill === "function") {
              this._fulfillmentHandler0 =
                  domain === null ? fulfill : util$1.domainBind(domain, fulfill);
          }
          if (typeof reject === "function") {
              this._rejectionHandler0 =
                  domain === null ? reject : util$1.domainBind(domain, reject);
          }
      } else {
          var base = index * 4 - 4;
          this[base + 2] = promise;
          this[base + 3] = receiver;
          if (typeof fulfill === "function") {
              this[base + 0] =
                  domain === null ? fulfill : util$1.domainBind(domain, fulfill);
          }
          if (typeof reject === "function") {
              this[base + 1] =
                  domain === null ? reject : util$1.domainBind(domain, reject);
          }
      }
      this._setLength(index + 1);
      return index;
  };

  Promise.prototype._proxy = function (proxyable, arg) {
      this._addCallbacks(undefined, undefined, arg, proxyable, null);
  };

  Promise.prototype._resolveCallback = function(value, shouldBind) {
      if (((this._bitField & 117506048) !== 0)) return;
      if (value === this)
          return this._rejectCallback(makeSelfResolutionError(), false);
      var maybePromise = tryConvertToPromise(value, this);
      if (!(maybePromise instanceof Promise)) return this._fulfill(value);

      if (shouldBind) this._propagateFrom(maybePromise, 2);

      var promise = maybePromise._target();

      if (promise === this) {
          this._reject(makeSelfResolutionError());
          return;
      }

      var bitField = promise._bitField;
      if (((bitField & 50397184) === 0)) {
          var len = this._length();
          if (len > 0) promise._migrateCallback0(this);
          for (var i = 1; i < len; ++i) {
              promise._migrateCallbackAt(this, i);
          }
          this._setFollowing();
          this._setLength(0);
          this._setFollowee(promise);
      } else if (((bitField & 33554432) !== 0)) {
          this._fulfill(promise._value());
      } else if (((bitField & 16777216) !== 0)) {
          this._reject(promise._reason());
      } else {
          var reason = new CancellationError("late cancellation observer");
          promise._attachExtraTrace(reason);
          this._reject(reason);
      }
  };

  Promise.prototype._rejectCallback =
  function(reason, synchronous, ignoreNonErrorWarnings) {
      var trace = util$1.ensureErrorObject(reason);
      var hasStack = trace === reason;
      if (!hasStack && !ignoreNonErrorWarnings && debug.warnings()) {
          var message = "a promise was rejected with a non-error: " +
              util$1.classString(reason);
          this._warn(message, true);
      }
      this._attachExtraTrace(trace, synchronous ? hasStack : false);
      this._reject(reason);
  };

  Promise.prototype._resolveFromExecutor = function (executor) {
      if (executor === INTERNAL) return;
      var promise = this;
      this._captureStackTrace();
      this._pushContext();
      var synchronous = true;
      var r = this._execute(executor, function(value) {
          promise._resolveCallback(value);
      }, function (reason) {
          promise._rejectCallback(reason, synchronous);
      });
      synchronous = false;
      this._popContext();

      if (r !== undefined) {
          promise._rejectCallback(r, true);
      }
  };

  Promise.prototype._settlePromiseFromHandler = function (
      handler, receiver, value, promise
  ) {
      var bitField = promise._bitField;
      if (((bitField & 65536) !== 0)) return;
      promise._pushContext();
      var x;
      if (receiver === APPLY) {
          if (!value || typeof value.length !== "number") {
              x = errorObj;
              x.e = new TypeError("cannot .spread() a non-array: " +
                                      util$1.classString(value));
          } else {
              x = tryCatch(handler).apply(this._boundValue(), value);
          }
      } else {
          x = tryCatch(handler).call(receiver, value);
      }
      var promiseCreated = promise._popContext();
      bitField = promise._bitField;
      if (((bitField & 65536) !== 0)) return;

      if (x === NEXT_FILTER) {
          promise._reject(value);
      } else if (x === errorObj) {
          promise._rejectCallback(x.e, false);
      } else {
          debug.checkForgottenReturns(x, promiseCreated, "",  promise, this);
          promise._resolveCallback(x);
      }
  };

  Promise.prototype._target = function() {
      var ret = this;
      while (ret._isFollowing()) ret = ret._followee();
      return ret;
  };

  Promise.prototype._followee = function() {
      return this._rejectionHandler0;
  };

  Promise.prototype._setFollowee = function(promise) {
      this._rejectionHandler0 = promise;
  };

  Promise.prototype._settlePromise = function(promise, handler, receiver, value) {
      var isPromise = promise instanceof Promise;
      var bitField = this._bitField;
      var asyncGuaranteed = ((bitField & 134217728) !== 0);
      if (((bitField & 65536) !== 0)) {
          if (isPromise) promise._invokeInternalOnCancel();

          if (receiver instanceof PassThroughHandlerContext &&
              receiver.isFinallyHandler()) {
              receiver.cancelPromise = promise;
              if (tryCatch(handler).call(receiver, value) === errorObj) {
                  promise._reject(errorObj.e);
              }
          } else if (handler === reflectHandler) {
              promise._fulfill(reflectHandler.call(receiver));
          } else if (receiver instanceof Proxyable) {
              receiver._promiseCancelled(promise);
          } else if (isPromise || promise instanceof PromiseArray) {
              promise._cancel();
          } else {
              receiver.cancel();
          }
      } else if (typeof handler === "function") {
          if (!isPromise) {
              handler.call(receiver, value, promise);
          } else {
              if (asyncGuaranteed) promise._setAsyncGuaranteed();
              this._settlePromiseFromHandler(handler, receiver, value, promise);
          }
      } else if (receiver instanceof Proxyable) {
          if (!receiver._isResolved()) {
              if (((bitField & 33554432) !== 0)) {
                  receiver._promiseFulfilled(value, promise);
              } else {
                  receiver._promiseRejected(value, promise);
              }
          }
      } else if (isPromise) {
          if (asyncGuaranteed) promise._setAsyncGuaranteed();
          if (((bitField & 33554432) !== 0)) {
              promise._fulfill(value);
          } else {
              promise._reject(value);
          }
      }
  };

  Promise.prototype._settlePromiseLateCancellationObserver = function(ctx) {
      var handler = ctx.handler;
      var promise = ctx.promise;
      var receiver = ctx.receiver;
      var value = ctx.value;
      if (typeof handler === "function") {
          if (!(promise instanceof Promise)) {
              handler.call(receiver, value, promise);
          } else {
              this._settlePromiseFromHandler(handler, receiver, value, promise);
          }
      } else if (promise instanceof Promise) {
          promise._reject(value);
      }
  };

  Promise.prototype._settlePromiseCtx = function(ctx) {
      this._settlePromise(ctx.promise, ctx.handler, ctx.receiver, ctx.value);
  };

  Promise.prototype._settlePromise0 = function(handler, value, bitField) {
      var promise = this._promise0;
      var receiver = this._receiverAt(0);
      this._promise0 = undefined;
      this._receiver0 = undefined;
      this._settlePromise(promise, handler, receiver, value);
  };

  Promise.prototype._clearCallbackDataAtIndex = function(index) {
      var base = index * 4 - 4;
      this[base + 2] =
      this[base + 3] =
      this[base + 0] =
      this[base + 1] = undefined;
  };

  Promise.prototype._fulfill = function (value) {
      var bitField = this._bitField;
      if (((bitField & 117506048) >>> 16)) return;
      if (value === this) {
          var err = makeSelfResolutionError();
          this._attachExtraTrace(err);
          return this._reject(err);
      }
      this._setFulfilled();
      this._rejectionHandler0 = value;

      if ((bitField & 65535) > 0) {
          if (((bitField & 134217728) !== 0)) {
              this._settlePromises();
          } else {
              async$1.settlePromises(this);
          }
          this._dereferenceTrace();
      }
  };

  Promise.prototype._reject = function (reason) {
      var bitField = this._bitField;
      if (((bitField & 117506048) >>> 16)) return;
      this._setRejected();
      this._fulfillmentHandler0 = reason;

      if (this._isFinal()) {
          return async$1.fatalError(reason, util$1.isNode);
      }

      if ((bitField & 65535) > 0) {
          async$1.settlePromises(this);
      } else {
          this._ensurePossibleRejectionHandled();
      }
  };

  Promise.prototype._fulfillPromises = function (len, value) {
      for (var i = 1; i < len; i++) {
          var handler = this._fulfillmentHandlerAt(i);
          var promise = this._promiseAt(i);
          var receiver = this._receiverAt(i);
          this._clearCallbackDataAtIndex(i);
          this._settlePromise(promise, handler, receiver, value);
      }
  };

  Promise.prototype._rejectPromises = function (len, reason) {
      for (var i = 1; i < len; i++) {
          var handler = this._rejectionHandlerAt(i);
          var promise = this._promiseAt(i);
          var receiver = this._receiverAt(i);
          this._clearCallbackDataAtIndex(i);
          this._settlePromise(promise, handler, receiver, reason);
      }
  };

  Promise.prototype._settlePromises = function () {
      var bitField = this._bitField;
      var len = (bitField & 65535);

      if (len > 0) {
          if (((bitField & 16842752) !== 0)) {
              var reason = this._fulfillmentHandler0;
              this._settlePromise0(this._rejectionHandler0, reason, bitField);
              this._rejectPromises(len, reason);
          } else {
              var value = this._rejectionHandler0;
              this._settlePromise0(this._fulfillmentHandler0, value, bitField);
              this._fulfillPromises(len, value);
          }
          this._setLength(0);
      }
      this._clearCancellationData();
  };

  Promise.prototype._settledValue = function() {
      var bitField = this._bitField;
      if (((bitField & 33554432) !== 0)) {
          return this._rejectionHandler0;
      } else if (((bitField & 16777216) !== 0)) {
          return this._fulfillmentHandler0;
      }
  };

  if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
      es5$1.defineProperty(Promise.prototype, Symbol.toStringTag, {
          get: function () {
              return "Object";
          }
      });
  }

  function deferResolve(v) {this.promise._resolveCallback(v);}
  function deferReject(v) {this.promise._rejectCallback(v, false);}

  Promise.defer = Promise.pending = function() {
      debug.deprecated("Promise.defer", "new Promise");
      var promise = new Promise(INTERNAL);
      return {
          promise: promise,
          resolve: deferResolve,
          reject: deferReject
      };
  };

  util$1.notEnumerableProp(Promise,
                         "_makeSelfResolutionError",
                         makeSelfResolutionError);

  method(Promise, INTERNAL, tryConvertToPromise, apiRejection,
      debug);
  bind(Promise, INTERNAL, tryConvertToPromise, debug);
  cancel(Promise, PromiseArray, apiRejection, debug);
  direct_resolve(Promise);
  synchronous_inspection(Promise);
  join(
      Promise, PromiseArray, tryConvertToPromise, INTERNAL, async$1, getDomain);
  Promise.Promise = Promise;
  Promise.version = "3.5.5";
  call_get(Promise);
  generators(Promise, apiRejection, INTERNAL, tryConvertToPromise, Proxyable, debug);
  map(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
  nodeify(Promise);
  promisify(Promise, INTERNAL);
  props(Promise, PromiseArray, tryConvertToPromise, apiRejection);
  race(Promise, INTERNAL, tryConvertToPromise, apiRejection);
  reduce(Promise, PromiseArray, apiRejection, tryConvertToPromise, INTERNAL, debug);
  settle(Promise, PromiseArray, debug);
  some(Promise, PromiseArray, apiRejection);
  timers(Promise, INTERNAL, debug);
  using(Promise, apiRejection, tryConvertToPromise, createContext, INTERNAL, debug);
  any(Promise);
  each(Promise, INTERNAL);
  filter(Promise, INTERNAL);
                                                           
      util$1.toFastProperties(Promise);                                          
      util$1.toFastProperties(Promise.prototype);                                
      function fillTypes(value) {                                              
          var p = new Promise(INTERNAL);                                       
          p._fulfillmentHandler0 = value;                                      
          p._rejectionHandler0 = value;                                        
          p._promise0 = value;                                                 
          p._receiver0 = value;                                                
      }                                                                        
      // Complete slack tracking, opt out of field-type tracking and           
      // stabilize map                                                         
      fillTypes({a: 1});                                                       
      fillTypes({b: 2});                                                       
      fillTypes({c: 3});                                                       
      fillTypes(1);                                                            
      fillTypes(function(){});                                                 
      fillTypes(undefined);                                                    
      fillTypes(false);                                                        
      fillTypes(new Promise(INTERNAL));                                        
      debug.setBounds(Async.firstLineError, util$1.lastLineError);               
      return Promise;                                                          

  };
  });

  var old;
  if (typeof Promise !== "undefined") old = Promise;
  function noConflict() {
      try { if (Promise === bluebird) Promise = old; }
      catch (e) {}
      return bluebird;
  }
  var bluebird = promise();
  bluebird.noConflict = noConflict;
  var bluebird_1 = bluebird;

  /**
   * Check if we're required to add a port number.
   *
   * @see https://url.spec.whatwg.org/#default-port
   * @param {Number|String} port Port number we need to check
   * @param {String} protocol Protocol we need to check against.
   * @returns {Boolean} Is it a default port for the given protocol
   * @api private
   */
  var requiresPort = function required(port, protocol) {
    protocol = protocol.split(':')[0];
    port = +port;

    if (!port) return false;

    switch (protocol) {
      case 'http':
      case 'ws':
      return port !== 80;

      case 'https':
      case 'wss':
      return port !== 443;

      case 'ftp':
      return port !== 21;

      case 'gopher':
      return port !== 70;

      case 'file':
      return false;
    }

    return port !== 0;
  };

  var has = Object.prototype.hasOwnProperty
    , undef;

  /**
   * Decode a URI encoded string.
   *
   * @param {String} input The URI encoded string.
   * @returns {String|Null} The decoded string.
   * @api private
   */
  function decode(input) {
    try {
      return decodeURIComponent(input.replace(/\+/g, ' '));
    } catch (e) {
      return null;
    }
  }

  /**
   * Simple query string parser.
   *
   * @param {String} query The query string that needs to be parsed.
   * @returns {Object}
   * @api public
   */
  function querystring(query) {
    var parser = /([^=?&]+)=?([^&]*)/g
      , result = {}
      , part;

    while (part = parser.exec(query)) {
      var key = decode(part[1])
        , value = decode(part[2]);

      //
      // Prevent overriding of existing properties. This ensures that build-in
      // methods like `toString` or __proto__ are not overriden by malicious
      // querystrings.
      //
      // In the case if failed decoding, we want to omit the key/value pairs
      // from the result.
      //
      if (key === null || value === null || key in result) continue;
      result[key] = value;
    }

    return result;
  }

  /**
   * Transform a query string to an object.
   *
   * @param {Object} obj Object that should be transformed.
   * @param {String} prefix Optional prefix.
   * @returns {String}
   * @api public
   */
  function querystringify(obj, prefix) {
    prefix = prefix || '';

    var pairs = []
      , value
      , key;

    //
    // Optionally prefix with a '?' if needed
    //
    if ('string' !== typeof prefix) prefix = '?';

    for (key in obj) {
      if (has.call(obj, key)) {
        value = obj[key];

        //
        // Edge cases where we actually want to encode the value to an empty
        // string instead of the stringified value.
        //
        if (!value && (value === null || value === undef || isNaN(value))) {
          value = '';
        }

        key = encodeURIComponent(key);
        value = encodeURIComponent(value);

        //
        // If we failed to encode the strings, we should bail out as we don't
        // want to add invalid strings to the query.
        //
        if (key === null || value === null) continue;
        pairs.push(key +'='+ value);
      }
    }

    return pairs.length ? prefix + pairs.join('&') : '';
  }

  //
  // Expose the module.
  //
  var stringify = querystringify;
  var parse = querystring;

  var querystringify_1 = {
  	stringify: stringify,
  	parse: parse
  };

  var slashes = /^[A-Za-z][A-Za-z0-9+-.]*:\/\//
    , protocolre = /^([a-z][a-z0-9.+-]*:)?(\/\/)?([\S\s]*)/i
    , whitespace = '[\\x09\\x0A\\x0B\\x0C\\x0D\\x20\\xA0\\u1680\\u180E\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200A\\u202F\\u205F\\u3000\\u2028\\u2029\\uFEFF]'
    , left = new RegExp('^'+ whitespace +'+');

  /**
   * Trim a given string.
   *
   * @param {String} str String to trim.
   * @public
   */
  function trimLeft(str) {
    return (str ? str : '').toString().replace(left, '');
  }

  /**
   * These are the parse rules for the URL parser, it informs the parser
   * about:
   *
   * 0. The char it Needs to parse, if it's a string it should be done using
   *    indexOf, RegExp using exec and NaN means set as current value.
   * 1. The property we should set when parsing this value.
   * 2. Indication if it's backwards or forward parsing, when set as number it's
   *    the value of extra chars that should be split off.
   * 3. Inherit from location if non existing in the parser.
   * 4. `toLowerCase` the resulting value.
   */
  var rules = [
    ['#', 'hash'],                        // Extract from the back.
    ['?', 'query'],                       // Extract from the back.
    function sanitize(address) {          // Sanitize what is left of the address
      return address.replace('\\', '/');
    },
    ['/', 'pathname'],                    // Extract from the back.
    ['@', 'auth', 1],                     // Extract from the front.
    [NaN, 'host', undefined, 1, 1],       // Set left over value.
    [/:(\d+)$/, 'port', undefined, 1],    // RegExp the back.
    [NaN, 'hostname', undefined, 1, 1]    // Set left over.
  ];

  /**
   * These properties should not be copied or inherited from. This is only needed
   * for all non blob URL's as a blob URL does not include a hash, only the
   * origin.
   *
   * @type {Object}
   * @private
   */
  var ignore = { hash: 1, query: 1 };

  /**
   * The location object differs when your code is loaded through a normal page,
   * Worker or through a worker using a blob. And with the blobble begins the
   * trouble as the location object will contain the URL of the blob, not the
   * location of the page where our code is loaded in. The actual origin is
   * encoded in the `pathname` so we can thankfully generate a good "default"
   * location from it so we can generate proper relative URL's again.
   *
   * @param {Object|String} loc Optional default location object.
   * @returns {Object} lolcation object.
   * @public
   */
  function lolcation(loc) {
    var globalVar;

    if (typeof window !== 'undefined') globalVar = window;
    else if (typeof commonjsGlobal !== 'undefined') globalVar = commonjsGlobal;
    else if (typeof self !== 'undefined') globalVar = self;
    else globalVar = {};

    var location = globalVar.location || {};
    loc = loc || location;

    var finaldestination = {}
      , type = typeof loc
      , key;

    if ('blob:' === loc.protocol) {
      finaldestination = new Url(unescape(loc.pathname), {});
    } else if ('string' === type) {
      finaldestination = new Url(loc, {});
      for (key in ignore) delete finaldestination[key];
    } else if ('object' === type) {
      for (key in loc) {
        if (key in ignore) continue;
        finaldestination[key] = loc[key];
      }

      if (finaldestination.slashes === undefined) {
        finaldestination.slashes = slashes.test(loc.href);
      }
    }

    return finaldestination;
  }

  /**
   * @typedef ProtocolExtract
   * @type Object
   * @property {String} protocol Protocol matched in the URL, in lowercase.
   * @property {Boolean} slashes `true` if protocol is followed by "//", else `false`.
   * @property {String} rest Rest of the URL that is not part of the protocol.
   */

  /**
   * Extract protocol information from a URL with/without double slash ("//").
   *
   * @param {String} address URL we want to extract from.
   * @return {ProtocolExtract} Extracted information.
   * @private
   */
  function extractProtocol(address) {
    address = trimLeft(address);
    var match = protocolre.exec(address);

    return {
      protocol: match[1] ? match[1].toLowerCase() : '',
      slashes: !!match[2],
      rest: match[3]
    };
  }

  /**
   * Resolve a relative URL pathname against a base URL pathname.
   *
   * @param {String} relative Pathname of the relative URL.
   * @param {String} base Pathname of the base URL.
   * @return {String} Resolved pathname.
   * @private
   */
  function resolve(relative, base) {
    if (relative === '') return base;

    var path = (base || '/').split('/').slice(0, -1).concat(relative.split('/'))
      , i = path.length
      , last = path[i - 1]
      , unshift = false
      , up = 0;

    while (i--) {
      if (path[i] === '.') {
        path.splice(i, 1);
      } else if (path[i] === '..') {
        path.splice(i, 1);
        up++;
      } else if (up) {
        if (i === 0) unshift = true;
        path.splice(i, 1);
        up--;
      }
    }

    if (unshift) path.unshift('');
    if (last === '.' || last === '..') path.push('');

    return path.join('/');
  }

  /**
   * The actual URL instance. Instead of returning an object we've opted-in to
   * create an actual constructor as it's much more memory efficient and
   * faster and it pleases my OCD.
   *
   * It is worth noting that we should not use `URL` as class name to prevent
   * clashes with the global URL instance that got introduced in browsers.
   *
   * @constructor
   * @param {String} address URL we want to parse.
   * @param {Object|String} [location] Location defaults for relative paths.
   * @param {Boolean|Function} [parser] Parser for the query string.
   * @private
   */
  function Url(address, location, parser) {
    address = trimLeft(address);

    if (!(this instanceof Url)) {
      return new Url(address, location, parser);
    }

    var relative, extracted, parse, instruction, index, key
      , instructions = rules.slice()
      , type = typeof location
      , url = this
      , i = 0;

    //
    // The following if statements allows this module two have compatibility with
    // 2 different API:
    //
    // 1. Node.js's `url.parse` api which accepts a URL, boolean as arguments
    //    where the boolean indicates that the query string should also be parsed.
    //
    // 2. The `URL` interface of the browser which accepts a URL, object as
    //    arguments. The supplied object will be used as default values / fall-back
    //    for relative paths.
    //
    if ('object' !== type && 'string' !== type) {
      parser = location;
      location = null;
    }

    if (parser && 'function' !== typeof parser) parser = querystringify_1.parse;

    location = lolcation(location);

    //
    // Extract protocol information before running the instructions.
    //
    extracted = extractProtocol(address || '');
    relative = !extracted.protocol && !extracted.slashes;
    url.slashes = extracted.slashes || relative && location.slashes;
    url.protocol = extracted.protocol || location.protocol || '';
    address = extracted.rest;

    //
    // When the authority component is absent the URL starts with a path
    // component.
    //
    if (!extracted.slashes) instructions[3] = [/(.*)/, 'pathname'];

    for (; i < instructions.length; i++) {
      instruction = instructions[i];

      if (typeof instruction === 'function') {
        address = instruction(address);
        continue;
      }

      parse = instruction[0];
      key = instruction[1];

      if (parse !== parse) {
        url[key] = address;
      } else if ('string' === typeof parse) {
        if (~(index = address.indexOf(parse))) {
          if ('number' === typeof instruction[2]) {
            url[key] = address.slice(0, index);
            address = address.slice(index + instruction[2]);
          } else {
            url[key] = address.slice(index);
            address = address.slice(0, index);
          }
        }
      } else if ((index = parse.exec(address))) {
        url[key] = index[1];
        address = address.slice(0, index.index);
      }

      url[key] = url[key] || (
        relative && instruction[3] ? location[key] || '' : ''
      );

      //
      // Hostname, host and protocol should be lowercased so they can be used to
      // create a proper `origin`.
      //
      if (instruction[4]) url[key] = url[key].toLowerCase();
    }

    //
    // Also parse the supplied query string in to an object. If we're supplied
    // with a custom parser as function use that instead of the default build-in
    // parser.
    //
    if (parser) url.query = parser(url.query);

    //
    // If the URL is relative, resolve the pathname against the base URL.
    //
    if (
        relative
      && location.slashes
      && url.pathname.charAt(0) !== '/'
      && (url.pathname !== '' || location.pathname !== '')
    ) {
      url.pathname = resolve(url.pathname, location.pathname);
    }

    //
    // We should not add port numbers if they are already the default port number
    // for a given protocol. As the host also contains the port number we're going
    // override it with the hostname which contains no port number.
    //
    if (!requiresPort(url.port, url.protocol)) {
      url.host = url.hostname;
      url.port = '';
    }

    //
    // Parse down the `auth` for the username and password.
    //
    url.username = url.password = '';
    if (url.auth) {
      instruction = url.auth.split(':');
      url.username = instruction[0] || '';
      url.password = instruction[1] || '';
    }

    url.origin = url.protocol && url.host && url.protocol !== 'file:'
      ? url.protocol +'//'+ url.host
      : 'null';

    //
    // The href is just the compiled result.
    //
    url.href = url.toString();
  }

  /**
   * This is convenience method for changing properties in the URL instance to
   * insure that they all propagate correctly.
   *
   * @param {String} part          Property we need to adjust.
   * @param {Mixed} value          The newly assigned value.
   * @param {Boolean|Function} fn  When setting the query, it will be the function
   *                               used to parse the query.
   *                               When setting the protocol, double slash will be
   *                               removed from the final url if it is true.
   * @returns {URL} URL instance for chaining.
   * @public
   */
  function set(part, value, fn) {
    var url = this;

    switch (part) {
      case 'query':
        if ('string' === typeof value && value.length) {
          value = (fn || querystringify_1.parse)(value);
        }

        url[part] = value;
        break;

      case 'port':
        url[part] = value;

        if (!requiresPort(value, url.protocol)) {
          url.host = url.hostname;
          url[part] = '';
        } else if (value) {
          url.host = url.hostname +':'+ value;
        }

        break;

      case 'hostname':
        url[part] = value;

        if (url.port) value += ':'+ url.port;
        url.host = value;
        break;

      case 'host':
        url[part] = value;

        if (/:\d+$/.test(value)) {
          value = value.split(':');
          url.port = value.pop();
          url.hostname = value.join(':');
        } else {
          url.hostname = value;
          url.port = '';
        }

        break;

      case 'protocol':
        url.protocol = value.toLowerCase();
        url.slashes = !fn;
        break;

      case 'pathname':
      case 'hash':
        if (value) {
          var char = part === 'pathname' ? '/' : '#';
          url[part] = value.charAt(0) !== char ? char + value : value;
        } else {
          url[part] = value;
        }
        break;

      default:
        url[part] = value;
    }

    for (var i = 0; i < rules.length; i++) {
      var ins = rules[i];

      if (ins[4]) url[ins[1]] = url[ins[1]].toLowerCase();
    }

    url.origin = url.protocol && url.host && url.protocol !== 'file:'
      ? url.protocol +'//'+ url.host
      : 'null';

    url.href = url.toString();

    return url;
  }

  /**
   * Transform the properties back in to a valid and full URL string.
   *
   * @param {Function} stringify Optional query stringify function.
   * @returns {String} Compiled version of the URL.
   * @public
   */
  function toString(stringify) {
    if (!stringify || 'function' !== typeof stringify) stringify = querystringify_1.stringify;

    var query
      , url = this
      , protocol = url.protocol;

    if (protocol && protocol.charAt(protocol.length - 1) !== ':') protocol += ':';

    var result = protocol + (url.slashes ? '//' : '');

    if (url.username) {
      result += url.username;
      if (url.password) result += ':'+ url.password;
      result += '@';
    }

    result += url.host + url.pathname;

    query = 'object' === typeof url.query ? stringify(url.query) : url.query;
    if (query) result += '?' !== query.charAt(0) ? '?'+ query : query;

    if (url.hash) result += url.hash;

    return result;
  }

  Url.prototype = { set: set, toString: toString };

  //
  // Expose the URL parser and some additional properties that might be useful for
  // others or testing.
  //
  Url.extractProtocol = extractProtocol;
  Url.location = lolcation;
  Url.trimLeft = trimLeft;
  Url.qs = querystringify_1;

  var urlParse = Url;

  var domain;

  // This constructor is used to store event handlers. Instantiating this is
  // faster than explicitly calling `Object.create(null)` to get a "clean" empty
  // object (tested with v8 v4.9).
  function EventHandlers() {}
  EventHandlers.prototype = Object.create(null);

  function EventEmitter() {
    EventEmitter.init.call(this);
  }

  // nodejs oddity
  // require('events') === require('events').EventEmitter
  EventEmitter.EventEmitter = EventEmitter;

  EventEmitter.usingDomains = false;

  EventEmitter.prototype.domain = undefined;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  EventEmitter.defaultMaxListeners = 10;

  EventEmitter.init = function() {
    this.domain = null;
    if (EventEmitter.usingDomains) {
      // if there is an active domain, then attach to it.
      if (domain.active && !(this instanceof domain.Domain)) ;
    }

    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
  };

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || isNaN(n))
      throw new TypeError('"n" argument must be a positive number');
    this._maxListeners = n;
    return this;
  };

  function $getMaxListeners(that) {
    if (that._maxListeners === undefined)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return $getMaxListeners(this);
  };

  // These standalone emit* functions are used to optimize calling of event
  // handlers for fast cases because emit() itself often has a variable number of
  // arguments and can be deoptimized because of that. These functions always have
  // the same number of arguments and thus do not get deoptimized, so the code
  // inside them can execute faster.
  function emitNone(handler, isFn, self) {
    if (isFn)
      handler.call(self);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self);
    }
  }
  function emitOne(handler, isFn, self, arg1) {
    if (isFn)
      handler.call(self, arg1);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1);
    }
  }
  function emitTwo(handler, isFn, self, arg1, arg2) {
    if (isFn)
      handler.call(self, arg1, arg2);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2);
    }
  }
  function emitThree(handler, isFn, self, arg1, arg2, arg3) {
    if (isFn)
      handler.call(self, arg1, arg2, arg3);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2, arg3);
    }
  }

  function emitMany(handler, isFn, self, args) {
    if (isFn)
      handler.apply(self, args);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].apply(self, args);
    }
  }

  EventEmitter.prototype.emit = function emit(type) {
    var er, handler, len, args, i, events, domain;
    var doError = (type === 'error');

    events = this._events;
    if (events)
      doError = (doError && events.error == null);
    else if (!doError)
      return false;

    domain = this.domain;

    // If there is no 'error' event listener then throw.
    if (doError) {
      er = arguments[1];
      if (domain) {
        if (!er)
          er = new Error('Uncaught, unspecified "error" event');
        er.domainEmitter = this;
        er.domain = domain;
        er.domainThrown = false;
        domain.emit('error', er);
      } else if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
      return false;
    }

    handler = events[type];

    if (!handler)
      return false;

    var isFn = typeof handler === 'function';
    len = arguments.length;
    switch (len) {
      // fast cases
      case 1:
        emitNone(handler, isFn, this);
        break;
      case 2:
        emitOne(handler, isFn, this, arguments[1]);
        break;
      case 3:
        emitTwo(handler, isFn, this, arguments[1], arguments[2]);
        break;
      case 4:
        emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
        break;
      // slower
      default:
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        emitMany(handler, isFn, this, args);
    }

    return true;
  };

  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;

    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');

    events = target._events;
    if (!events) {
      events = target._events = new EventHandlers();
      target._eventsCount = 0;
    } else {
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (events.newListener) {
        target.emit('newListener', type,
                    listener.listener ? listener.listener : listener);

        // Re-assign `events` because a newListener handler could have caused the
        // this._events to be assigned to a new object
        events = target._events;
      }
      existing = events[type];
    }

    if (!existing) {
      // Optimize the case of one listener. Don't need the extra array object.
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = events[type] = prepend ? [listener, existing] :
                                            [existing, listener];
      } else {
        // If we've already got an array, just append.
        if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
      }

      // Check for listener leak
      if (!existing.warned) {
        m = $getMaxListeners(target);
        if (m && m > 0 && existing.length > m) {
          existing.warned = true;
          var w = new Error('Possible EventEmitter memory leak detected. ' +
                              existing.length + ' ' + type + ' listeners added. ' +
                              'Use emitter.setMaxListeners() to increase limit');
          w.name = 'MaxListenersExceededWarning';
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          emitWarning(w);
        }
      }
    }

    return target;
  }
  function emitWarning(e) {
    typeof console.warn === 'function' ? console.warn(e) : console.log(e);
  }
  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.prependListener =
      function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };

  function _onceWrap(target, type, listener) {
    var fired = false;
    function g() {
      target.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(target, arguments);
      }
    }
    g.listener = listener;
    return g;
  }

  EventEmitter.prototype.once = function once(type, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener =
      function prependOnceListener(type, listener) {
        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

  // emits a 'removeListener' event iff the listener was removed
  EventEmitter.prototype.removeListener =
      function removeListener(type, listener) {
        var list, events, position, i, originalListener;

        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');

        events = this._events;
        if (!events)
          return this;

        list = events[type];
        if (!list)
          return this;

        if (list === listener || (list.listener && list.listener === listener)) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else {
            delete events[type];
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener);
          }
        } else if (typeof list !== 'function') {
          position = -1;

          for (i = list.length; i-- > 0;) {
            if (list[i] === listener ||
                (list[i].listener && list[i].listener === listener)) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0)
            return this;

          if (list.length === 1) {
            list[0] = undefined;
            if (--this._eventsCount === 0) {
              this._events = new EventHandlers();
              return this;
            } else {
              delete events[type];
            }
          } else {
            spliceOne(list, position);
          }

          if (events.removeListener)
            this.emit('removeListener', type, originalListener || listener);
        }

        return this;
      };

  EventEmitter.prototype.removeAllListeners =
      function removeAllListeners(type) {
        var listeners, events;

        events = this._events;
        if (!events)
          return this;

        // not listening for removeListener, no need to emit
        if (!events.removeListener) {
          if (arguments.length === 0) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
          } else if (events[type]) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else
              delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          for (var i = 0, key; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = new EventHandlers();
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else if (listeners) {
          // LIFO order
          do {
            this.removeListener(type, listeners[listeners.length - 1]);
          } while (listeners[0]);
        }

        return this;
      };

  EventEmitter.prototype.listeners = function listeners(type) {
    var evlistener;
    var ret;
    var events = this._events;

    if (!events)
      ret = [];
    else {
      evlistener = events[type];
      if (!evlistener)
        ret = [];
      else if (typeof evlistener === 'function')
        ret = [evlistener.listener || evlistener];
      else
        ret = unwrapListeners(evlistener);
    }

    return ret;
  };

  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };

  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events = this._events;

    if (events) {
      var evlistener = events[type];

      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener) {
        return evlistener.length;
      }
    }

    return 0;
  }

  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
  };

  // About 1.5x faster than the two-arg version of Array#splice().
  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
      list[i] = list[k];
    list.pop();
  }

  function arrayClone(arr, i) {
    var copy = new Array(i);
    while (i--)
      copy[i] = arr[i];
    return copy;
  }

  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }

  // 7.2.1 RequireObjectCoercible(argument)
  var _defined = function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  };

  // 7.1.13 ToObject(argument)

  var _toObject = function (it) {
    return Object(_defined(it));
  };

  var hasOwnProperty = {}.hasOwnProperty;
  var _has = function (it, key) {
    return hasOwnProperty.call(it, key);
  };

  var toString$1 = {}.toString;

  var _cof = function (it) {
    return toString$1.call(it).slice(8, -1);
  };

  // fallback for non-array-like ES3 and non-enumerable old V8 strings

  // eslint-disable-next-line no-prototype-builtins
  var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return _cof(it) == 'String' ? it.split('') : Object(it);
  };

  // to indexed object, toObject with fallback for non-array-like ES3 strings


  var _toIobject = function (it) {
    return _iobject(_defined(it));
  };

  // 7.1.4 ToInteger
  var ceil = Math.ceil;
  var floor = Math.floor;
  var _toInteger = function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };

  // 7.1.15 ToLength

  var min = Math.min;
  var _toLength = function (it) {
    return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };

  var max = Math.max;
  var min$1 = Math.min;
  var _toAbsoluteIndex = function (index, length) {
    index = _toInteger(index);
    return index < 0 ? max(index + length, 0) : min$1(index, length);
  };

  // false -> Array#indexOf
  // true  -> Array#includes



  var _arrayIncludes = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = _toIobject($this);
      var length = _toLength(O.length);
      var index = _toAbsoluteIndex(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  var commonjsGlobal$1 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global$1 !== 'undefined' ? global$1 : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule$1(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _core = createCommonjsModule$1(function (module) {
  var core = module.exports = { version: '2.6.9' };
  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  });
  var _core_1 = _core.version;

  var _global = createCommonjsModule$1(function (module) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math
    ? window : typeof self != 'undefined' && self.Math == Math ? self
    // eslint-disable-next-line no-new-func
    : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  });

  var _library = true;

  var _shared = createCommonjsModule$1(function (module) {
  var SHARED = '__core-js_shared__';
  var store = _global[SHARED] || (_global[SHARED] = {});

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: _core.version,
    mode:  'pure' ,
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
  });
  });

  var id = 0;
  var px = Math.random();
  var _uid = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };

  var shared = _shared('keys');

  var _sharedKey = function (key) {
    return shared[key] || (shared[key] = _uid(key));
  };

  var arrayIndexOf = _arrayIncludes(false);
  var IE_PROTO = _sharedKey('IE_PROTO');

  var _objectKeysInternal = function (object, names) {
    var O = _toIobject(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (_has(O, key = names[i++])) {
      ~arrayIndexOf(result, key) || result.push(key);
    }
    return result;
  };

  // IE 8- don't enum bug keys
  var _enumBugKeys = (
    'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
  ).split(',');

  // 19.1.2.14 / 15.2.3.14 Object.keys(O)



  var _objectKeys = Object.keys || function keys(O) {
    return _objectKeysInternal(O, _enumBugKeys);
  };

  var _aFunction = function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  };

  // optional / simple context binding

  var _ctx = function (fn, that, length) {
    _aFunction(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var _isObject = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  var _anObject = function (it) {
    if (!_isObject(it)) throw TypeError(it + ' is not an object!');
    return it;
  };

  var _fails = function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var _descriptors = !_fails(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  var document$1 = _global.document;
  // typeof document.createElement is 'object' in old IE
  var is = _isObject(document$1) && _isObject(document$1.createElement);
  var _domCreate = function (it) {
    return is ? document$1.createElement(it) : {};
  };

  var _ie8DomDefine = !_descriptors && !_fails(function () {
    return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
  });

  // 7.1.1 ToPrimitive(input [, PreferredType])

  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var _toPrimitive = function (it, S) {
    if (!_isObject(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var dP = Object.defineProperty;

  var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    _anObject(O);
    P = _toPrimitive(P, true);
    _anObject(Attributes);
    if (_ie8DomDefine) try {
      return dP(O, P, Attributes);
    } catch (e) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var _objectDp = {
  	f: f
  };

  var _propertyDesc = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var _hide = _descriptors ? function (object, key, value) {
    return _objectDp.f(object, key, _propertyDesc(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var PROTOTYPE = 'prototype';

  var $export = function (type, name, source) {
    var IS_FORCED = type & $export.F;
    var IS_GLOBAL = type & $export.G;
    var IS_STATIC = type & $export.S;
    var IS_PROTO = type & $export.P;
    var IS_BIND = type & $export.B;
    var IS_WRAP = type & $export.W;
    var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
    var expProto = exports[PROTOTYPE];
    var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
    var key, own, out;
    if (IS_GLOBAL) source = name;
    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined;
      if (own && _has(exports, key)) continue;
      // export native or passed
      out = own ? target[key] : source[key];
      // prevent global pollution for namespaces
      exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
      // bind timers to global for call from export context
      : IS_BIND && own ? _ctx(out, _global)
      // wrap global constructors for prevent change them in library
      : IS_WRAP && target[key] == out ? (function (C) {
        var F = function (a, b, c) {
          if (this instanceof C) {
            switch (arguments.length) {
              case 0: return new C();
              case 1: return new C(a);
              case 2: return new C(a, b);
            } return new C(a, b, c);
          } return C.apply(this, arguments);
        };
        F[PROTOTYPE] = C[PROTOTYPE];
        return F;
      // make static versions for prototype methods
      })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
      // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
      if (IS_PROTO) {
        (exports.virtual || (exports.virtual = {}))[key] = out;
        // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
        if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
      }
    }
  };
  // type bitmap
  $export.F = 1;   // forced
  $export.G = 2;   // global
  $export.S = 4;   // static
  $export.P = 8;   // proto
  $export.B = 16;  // bind
  $export.W = 32;  // wrap
  $export.U = 64;  // safe
  $export.R = 128; // real proto method for `library`
  var _export = $export;

  // most Object methods by ES6 should accept primitives



  var _objectSap = function (KEY, exec) {
    var fn = (_core.Object || {})[KEY] || Object[KEY];
    var exp = {};
    exp[KEY] = exec(fn);
    _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
  };

  // 19.1.2.14 Object.keys(O)



  _objectSap('keys', function () {
    return function keys(it) {
      return _objectKeys(_toObject(it));
    };
  });

  var keys = _core.Object.keys;

  var keys$1 = keys;

  // 19.1.2.4 / 15.2.3.6 Object.defineProperty(O, P, Attributes)
  _export(_export.S + _export.F * !_descriptors, 'Object', { defineProperty: _objectDp.f });

  var $Object = _core.Object;
  var defineProperty$1 = function defineProperty(it, key, desc) {
    return $Object.defineProperty(it, key, desc);
  };

  var defineProperty$1$1 = defineProperty$1;

  var $JSON = _core.JSON || (_core.JSON = { stringify: JSON.stringify });
  var stringify$1 = function stringify(it) { // eslint-disable-line no-unused-vars
    return $JSON.stringify.apply($JSON, arguments);
  };

  var stringify$1$1 = stringify$1;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var classCallCheck = _classCallCheck;

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;

      defineProperty$1$1(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  var createClass = _createClass;

  // true  -> String#at
  // false -> String#codePointAt
  var _stringAt = function (TO_STRING) {
    return function (that, pos) {
      var s = String(_defined(that));
      var i = _toInteger(pos);
      var l = s.length;
      var a, b;
      if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };

  var _redefine = _hide;

  var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
    _anObject(O);
    var keys = _objectKeys(Properties);
    var length = keys.length;
    var i = 0;
    var P;
    while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
    return O;
  };

  var document$2 = _global.document;
  var _html = document$2 && document$2.documentElement;

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



  var IE_PROTO$1 = _sharedKey('IE_PROTO');
  var Empty = function () { /* empty */ };
  var PROTOTYPE$1 = 'prototype';

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = _domCreate('iframe');
    var i = _enumBugKeys.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';
    _html.appendChild(iframe);
    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    createDict = iframeDocument.F;
    while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
    return createDict();
  };

  var _objectCreate = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty[PROTOTYPE$1] = _anObject(O);
      result = new Empty();
      Empty[PROTOTYPE$1] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1] = O;
    } else result = createDict();
    return Properties === undefined ? result : _objectDps(result, Properties);
  };

  var _wks = createCommonjsModule$1(function (module) {
  var store = _shared('wks');

  var Symbol = _global.Symbol;
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] =
      USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
  };

  $exports.store = store;
  });

  var def = _objectDp.f;

  var TAG = _wks('toStringTag');

  var _setToStringTag = function (it, tag, stat) {
    if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
  };

  var IteratorPrototype = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  _hide(IteratorPrototype, _wks('iterator'), function () { return this; });

  var _iterCreate = function (Constructor, NAME, next) {
    Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
    _setToStringTag(Constructor, NAME + ' Iterator');
  };

  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


  var IE_PROTO$2 = _sharedKey('IE_PROTO');
  var ObjectProto = Object.prototype;

  var _objectGpo = Object.getPrototypeOf || function (O) {
    O = _toObject(O);
    if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto : null;
  };

  var ITERATOR = _wks('iterator');
  var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
  var FF_ITERATOR = '@@iterator';
  var KEYS = 'keys';
  var VALUES = 'values';

  var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    _iterCreate(Constructor, NAME, next);
    var getMethod = function (kind) {
      if (!BUGGY && kind in proto) return proto[kind];
      switch (kind) {
        case KEYS: return function keys() { return new Constructor(this, kind); };
        case VALUES: return function values() { return new Constructor(this, kind); };
      } return function entries() { return new Constructor(this, kind); };
    };
    var TAG = NAME + ' Iterator';
    var DEF_VALUES = DEFAULT == VALUES;
    var VALUES_BUG = false;
    var proto = Base.prototype;
    var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
    var $default = $native || getMethod(DEFAULT);
    var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
    var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
    var methods, key, IteratorPrototype;
    // Fix native
    if ($anyNative) {
      IteratorPrototype = _objectGpo($anyNative.call(new Base()));
      if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
        // Set @@toStringTag to native iterators
        _setToStringTag(IteratorPrototype, TAG, true);
      }
    }
    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEF_VALUES && $native && $native.name !== VALUES) {
      VALUES_BUG = true;
      $default = function values() { return $native.call(this); };
    }
    // Define iterator
    if (( FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
      _hide(proto, ITERATOR, $default);
    }
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: $entries
      };
      if (FORCED) for (key in methods) {
        if (!(key in proto)) _redefine(proto, key, methods[key]);
      } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }
    return methods;
  };

  var $at = _stringAt(true);

  // 21.1.3.27 String.prototype[@@iterator]()
  _iterDefine(String, 'String', function (iterated) {
    this._t = String(iterated); // target
    this._i = 0;                // next index
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var index = this._i;
    var point;
    if (index >= O.length) return { value: undefined, done: true };
    point = $at(O, index);
    this._i += point.length;
    return { value: point, done: false };
  });

  var _iterStep = function (done, value) {
    return { value: value, done: !!done };
  };

  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
    this._t = _toIobject(iterated); // target
    this._i = 0;                   // next index
    this._k = kind;                // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var kind = this._k;
    var index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return _iterStep(1);
    }
    if (kind == 'keys') return _iterStep(0, index);
    if (kind == 'values') return _iterStep(0, O[index]);
    return _iterStep(0, [index, O[index]]);
  }, 'values');

  var TO_STRING_TAG = _wks('toStringTag');

  var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
    'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
    'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
    'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
    'TextTrackList,TouchList').split(',');

  for (var i$1 = 0; i$1 < DOMIterables.length; i$1++) {
    var NAME = DOMIterables[i$1];
    var Collection = _global[NAME];
    var proto = Collection && Collection.prototype;
    if (proto && !proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
  }

  var f$1 = _wks;

  var _wksExt = {
  	f: f$1
  };

  var iterator = _wksExt.f('iterator');

  var iterator$1 = iterator;

  var _meta = createCommonjsModule$1(function (module) {
  var META = _uid('meta');


  var setDesc = _objectDp.f;
  var id = 0;
  var isExtensible = Object.isExtensible || function () {
    return true;
  };
  var FREEZE = !_fails(function () {
    return isExtensible(Object.preventExtensions({}));
  });
  var setMeta = function (it) {
    setDesc(it, META, { value: {
      i: 'O' + ++id, // object ID
      w: {}          // weak collections IDs
    } });
  };
  var fastKey = function (it, create) {
    // return primitive with prefix
    if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return 'F';
      // not necessary to add metadata
      if (!create) return 'E';
      // add missing metadata
      setMeta(it);
    // return object ID
    } return it[META].i;
  };
  var getWeak = function (it, create) {
    if (!_has(it, META)) {
      // can't set metadata to uncaught frozen object
      if (!isExtensible(it)) return true;
      // not necessary to add metadata
      if (!create) return false;
      // add missing metadata
      setMeta(it);
    // return hash weak collections IDs
    } return it[META].w;
  };
  // add metadata on freeze-family methods calling
  var onFreeze = function (it) {
    if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
    return it;
  };
  var meta = module.exports = {
    KEY: META,
    NEED: false,
    fastKey: fastKey,
    getWeak: getWeak,
    onFreeze: onFreeze
  };
  });
  var _meta_1 = _meta.KEY;
  var _meta_2 = _meta.NEED;
  var _meta_3 = _meta.fastKey;
  var _meta_4 = _meta.getWeak;
  var _meta_5 = _meta.onFreeze;

  var defineProperty$2 = _objectDp.f;
  var _wksDefine = function (name) {
    var $Symbol = _core.Symbol || (_core.Symbol =  {} );
    if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty$2($Symbol, name, { value: _wksExt.f(name) });
  };

  var f$2 = Object.getOwnPropertySymbols;

  var _objectGops = {
  	f: f$2
  };

  var f$3 = {}.propertyIsEnumerable;

  var _objectPie = {
  	f: f$3
  };

  // all enumerable object keys, includes symbols



  var _enumKeys = function (it) {
    var result = _objectKeys(it);
    var getSymbols = _objectGops.f;
    if (getSymbols) {
      var symbols = getSymbols(it);
      var isEnum = _objectPie.f;
      var i = 0;
      var key;
      while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
    } return result;
  };

  // 7.2.2 IsArray(argument)

  var _isArray = Array.isArray || function isArray(arg) {
    return _cof(arg) == 'Array';
  };

  // 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

  var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

  var f$4 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
    return _objectKeysInternal(O, hiddenKeys);
  };

  var _objectGopn = {
  	f: f$4
  };

  // fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

  var gOPN = _objectGopn.f;
  var toString$1$1 = {}.toString;

  var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
    ? Object.getOwnPropertyNames(window) : [];

  var getWindowNames = function (it) {
    try {
      return gOPN(it);
    } catch (e) {
      return windowNames.slice();
    }
  };

  var f$5 = function getOwnPropertyNames(it) {
    return windowNames && toString$1$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
  };

  var _objectGopnExt = {
  	f: f$5
  };

  var gOPD = Object.getOwnPropertyDescriptor;

  var f$6 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
    O = _toIobject(O);
    P = _toPrimitive(P, true);
    if (_ie8DomDefine) try {
      return gOPD(O, P);
    } catch (e) { /* empty */ }
    if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
  };

  var _objectGopd = {
  	f: f$6
  };

  // ECMAScript 6 symbols shim





  var META = _meta.KEY;





















  var gOPD$1 = _objectGopd.f;
  var dP$1 = _objectDp.f;
  var gOPN$1 = _objectGopnExt.f;
  var $Symbol = _global.Symbol;
  var $JSON$1 = _global.JSON;
  var _stringify = $JSON$1 && $JSON$1.stringify;
  var PROTOTYPE$2 = 'prototype';
  var HIDDEN = _wks('_hidden');
  var TO_PRIMITIVE = _wks('toPrimitive');
  var isEnum = {}.propertyIsEnumerable;
  var SymbolRegistry = _shared('symbol-registry');
  var AllSymbols = _shared('symbols');
  var OPSymbols = _shared('op-symbols');
  var ObjectProto$1 = Object[PROTOTYPE$2];
  var USE_NATIVE = typeof $Symbol == 'function' && !!_objectGops.f;
  var QObject = _global.QObject;
  // Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
  var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

  // fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
  var setSymbolDesc = _descriptors && _fails(function () {
    return _objectCreate(dP$1({}, 'a', {
      get: function () { return dP$1(this, 'a', { value: 7 }).a; }
    })).a != 7;
  }) ? function (it, key, D) {
    var protoDesc = gOPD$1(ObjectProto$1, key);
    if (protoDesc) delete ObjectProto$1[key];
    dP$1(it, key, D);
    if (protoDesc && it !== ObjectProto$1) dP$1(ObjectProto$1, key, protoDesc);
  } : dP$1;

  var wrap = function (tag) {
    var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
    sym._k = tag;
    return sym;
  };

  var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
    return typeof it == 'symbol';
  } : function (it) {
    return it instanceof $Symbol;
  };

  var $defineProperty = function defineProperty(it, key, D) {
    if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
    _anObject(it);
    key = _toPrimitive(key, true);
    _anObject(D);
    if (_has(AllSymbols, key)) {
      if (!D.enumerable) {
        if (!_has(it, HIDDEN)) dP$1(it, HIDDEN, _propertyDesc(1, {}));
        it[HIDDEN][key] = true;
      } else {
        if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
        D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
      } return setSymbolDesc(it, key, D);
    } return dP$1(it, key, D);
  };
  var $defineProperties = function defineProperties(it, P) {
    _anObject(it);
    var keys = _enumKeys(P = _toIobject(P));
    var i = 0;
    var l = keys.length;
    var key;
    while (l > i) $defineProperty(it, key = keys[i++], P[key]);
    return it;
  };
  var $create = function create(it, P) {
    return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
  };
  var $propertyIsEnumerable = function propertyIsEnumerable(key) {
    var E = isEnum.call(this, key = _toPrimitive(key, true));
    if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
    return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
  };
  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
    it = _toIobject(it);
    key = _toPrimitive(key, true);
    if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
    var D = gOPD$1(it, key);
    if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
    return D;
  };
  var $getOwnPropertyNames = function getOwnPropertyNames(it) {
    var names = gOPN$1(_toIobject(it));
    var result = [];
    var i = 0;
    var key;
    while (names.length > i) {
      if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
    } return result;
  };
  var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
    var IS_OP = it === ObjectProto$1;
    var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
    var result = [];
    var i = 0;
    var key;
    while (names.length > i) {
      if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
    } return result;
  };

  // 19.4.1.1 Symbol([description])
  if (!USE_NATIVE) {
    $Symbol = function Symbol() {
      if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
      var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
      var $set = function (value) {
        if (this === ObjectProto$1) $set.call(OPSymbols, value);
        if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
        setSymbolDesc(this, tag, _propertyDesc(1, value));
      };
      if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
      return wrap(tag);
    };
    _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
      return this._k;
    });

    _objectGopd.f = $getOwnPropertyDescriptor;
    _objectDp.f = $defineProperty;
    _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
    _objectPie.f = $propertyIsEnumerable;
    _objectGops.f = $getOwnPropertySymbols;

    if (_descriptors && !_library) {
      _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
    }

    _wksExt.f = function (name) {
      return wrap(_wks(name));
    };
  }

  _export(_export.G + _export.W + _export.F * !USE_NATIVE, { Symbol: $Symbol });

  for (var es6Symbols = (
    // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
    'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
  ).split(','), j = 0; es6Symbols.length > j;)_wks(es6Symbols[j++]);

  for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

  _export(_export.S + _export.F * !USE_NATIVE, 'Symbol', {
    // 19.4.2.1 Symbol.for(key)
    'for': function (key) {
      return _has(SymbolRegistry, key += '')
        ? SymbolRegistry[key]
        : SymbolRegistry[key] = $Symbol(key);
    },
    // 19.4.2.5 Symbol.keyFor(sym)
    keyFor: function keyFor(sym) {
      if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
      for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
    },
    useSetter: function () { setter = true; },
    useSimple: function () { setter = false; }
  });

  _export(_export.S + _export.F * !USE_NATIVE, 'Object', {
    // 19.1.2.2 Object.create(O [, Properties])
    create: $create,
    // 19.1.2.4 Object.defineProperty(O, P, Attributes)
    defineProperty: $defineProperty,
    // 19.1.2.3 Object.defineProperties(O, Properties)
    defineProperties: $defineProperties,
    // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    // 19.1.2.7 Object.getOwnPropertyNames(O)
    getOwnPropertyNames: $getOwnPropertyNames,
    // 19.1.2.8 Object.getOwnPropertySymbols(O)
    getOwnPropertySymbols: $getOwnPropertySymbols
  });

  // Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
  // https://bugs.chromium.org/p/v8/issues/detail?id=3443
  var FAILS_ON_PRIMITIVES = _fails(function () { _objectGops.f(1); });

  _export(_export.S + _export.F * FAILS_ON_PRIMITIVES, 'Object', {
    getOwnPropertySymbols: function getOwnPropertySymbols(it) {
      return _objectGops.f(_toObject(it));
    }
  });

  // 24.3.2 JSON.stringify(value [, replacer [, space]])
  $JSON$1 && _export(_export.S + _export.F * (!USE_NATIVE || _fails(function () {
    var S = $Symbol();
    // MS Edge converts symbol values to JSON as {}
    // WebKit converts symbol values to JSON as null
    // V8 throws on boxed symbols
    return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
  })), 'JSON', {
    stringify: function stringify(it) {
      var args = [it];
      var i = 1;
      var replacer, $replacer;
      while (arguments.length > i) args.push(arguments[i++]);
      $replacer = replacer = args[1];
      if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
      if (!_isArray(replacer)) replacer = function (key, value) {
        if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
        if (!isSymbol(value)) return value;
      };
      args[1] = replacer;
      return _stringify.apply($JSON$1, args);
    }
  });

  // 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
  $Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
  // 19.4.3.5 Symbol.prototype[@@toStringTag]
  _setToStringTag($Symbol, 'Symbol');
  // 20.2.1.9 Math[@@toStringTag]
  _setToStringTag(Math, 'Math', true);
  // 24.3.3 JSON[@@toStringTag]
  _setToStringTag(_global.JSON, 'JSON', true);

  _wksDefine('asyncIterator');

  _wksDefine('observable');

  var symbol = _core.Symbol;

  var symbol$1 = symbol;

  var _typeof_1 = createCommonjsModule$1(function (module) {
  function _typeof2(obj) { if (typeof symbol$1 === "function" && typeof iterator$1 === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof symbol$1 === "function" && obj.constructor === symbol$1 && obj !== symbol$1.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

  function _typeof(obj) {
    if (typeof symbol$1 === "function" && _typeof2(iterator$1) === "symbol") {
      module.exports = _typeof = function _typeof(obj) {
        return _typeof2(obj);
      };
    } else {
      module.exports = _typeof = function _typeof(obj) {
        return obj && typeof symbol$1 === "function" && obj.constructor === symbol$1 && obj !== symbol$1.prototype ? "symbol" : _typeof2(obj);
      };
    }

    return _typeof(obj);
  }

  module.exports = _typeof;
  });

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  var assertThisInitialized = _assertThisInitialized;

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof_1(call) === "object" || typeof call === "function")) {
      return call;
    }

    return assertThisInitialized(self);
  }

  var possibleConstructorReturn = _possibleConstructorReturn;

  // 19.1.2.9 Object.getPrototypeOf(O)



  _objectSap('getPrototypeOf', function () {
    return function getPrototypeOf(it) {
      return _objectGpo(_toObject(it));
    };
  });

  var getPrototypeOf = _core.Object.getPrototypeOf;

  var getPrototypeOf$1 = getPrototypeOf;

  // Works with __proto__ only. Old v8 can't work with null proto objects.
  /* eslint-disable no-proto */


  var check = function (O, proto) {
    _anObject(O);
    if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
  };
  var _setProto = {
    set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
      function (test, buggy, set) {
        try {
          set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
          set(test, []);
          buggy = !(test instanceof Array);
        } catch (e) { buggy = true; }
        return function setPrototypeOf(O, proto) {
          check(O, proto);
          if (buggy) O.__proto__ = proto;
          else set(O, proto);
          return O;
        };
      }({}, false) : undefined),
    check: check
  };

  // 19.1.3.19 Object.setPrototypeOf(O, proto)

  _export(_export.S, 'Object', { setPrototypeOf: _setProto.set });

  var setPrototypeOf = _core.Object.setPrototypeOf;

  var setPrototypeOf$1 = setPrototypeOf;

  var getPrototypeOf$2 = createCommonjsModule$1(function (module) {
  function _getPrototypeOf(o) {
    module.exports = _getPrototypeOf = setPrototypeOf$1 ? getPrototypeOf$1 : function _getPrototypeOf(o) {
      return o.__proto__ || getPrototypeOf$1(o);
    };
    return _getPrototypeOf(o);
  }

  module.exports = _getPrototypeOf;
  });

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
  _export(_export.S, 'Object', { create: _objectCreate });

  var $Object$1 = _core.Object;
  var create = function create(P, D) {
    return $Object$1.create(P, D);
  };

  var create$1 = create;

  var setPrototypeOf$2 = createCommonjsModule$1(function (module) {
  function _setPrototypeOf(o, p) {
    module.exports = _setPrototypeOf = setPrototypeOf$1 || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  module.exports = _setPrototypeOf;
  });

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = create$1(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) setPrototypeOf$2(subClass, superClass);
  }

  var inherits$2 = _inherits;

  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }

  var _listCacheClear = listCacheClear;

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  var eq_1 = eq;

  /**
   * Gets the index at which the `key` is found in `array` of key-value pairs.
   *
   * @private
   * @param {Array} array The array to inspect.
   * @param {*} key The key to search for.
   * @returns {number} Returns the index of the matched value, else `-1`.
   */
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq_1(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }

  var _assocIndexOf = assocIndexOf;

  /** Used for built-in method references. */
  var arrayProto = Array.prototype;

  /** Built-in value references. */
  var splice = arrayProto.splice;

  /**
   * Removes `key` and its value from the list cache.
   *
   * @private
   * @name delete
   * @memberOf ListCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function listCacheDelete(key) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }

  var _listCacheDelete = listCacheDelete;

  /**
   * Gets the list cache value for `key`.
   *
   * @private
   * @name get
   * @memberOf ListCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function listCacheGet(key) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    return index < 0 ? undefined : data[index][1];
  }

  var _listCacheGet = listCacheGet;

  /**
   * Checks if a list cache value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf ListCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function listCacheHas(key) {
    return _assocIndexOf(this.__data__, key) > -1;
  }

  var _listCacheHas = listCacheHas;

  /**
   * Sets the list cache `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf ListCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the list cache instance.
   */
  function listCacheSet(key, value) {
    var data = this.__data__,
        index = _assocIndexOf(data, key);

    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }

  var _listCacheSet = listCacheSet;

  /**
   * Creates an list cache object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `ListCache`.
  ListCache.prototype.clear = _listCacheClear;
  ListCache.prototype['delete'] = _listCacheDelete;
  ListCache.prototype.get = _listCacheGet;
  ListCache.prototype.has = _listCacheHas;
  ListCache.prototype.set = _listCacheSet;

  var _ListCache = ListCache;

  /**
   * Removes all key-value entries from the stack.
   *
   * @private
   * @name clear
   * @memberOf Stack
   */
  function stackClear() {
    this.__data__ = new _ListCache;
    this.size = 0;
  }

  var _stackClear = stackClear;

  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);

    this.size = data.size;
    return result;
  }

  var _stackDelete = stackDelete;

  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function stackGet(key) {
    return this.__data__.get(key);
  }

  var _stackGet = stackGet;

  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function stackHas(key) {
    return this.__data__.has(key);
  }

  var _stackHas = stackHas;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof commonjsGlobal$1 == 'object' && commonjsGlobal$1 && commonjsGlobal$1.Object === Object && commonjsGlobal$1;

  var _freeGlobal = freeGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = _freeGlobal || freeSelf || Function('return this')();

  var _root = root;

  /** Built-in value references. */
  var Symbol$1 = _root.Symbol;

  var _Symbol = Symbol$1;

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1 = objectProto.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /** Built-in value references. */
  var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty$1.call(value, symToStringTag),
        tag = value[symToStringTag];

    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }

  var _getRawTag = getRawTag;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$1.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString$1.call(value);
  }

  var _objectToString = objectToString;

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag$1 = _Symbol ? _Symbol.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag$1 && symToStringTag$1 in Object(value))
      ? _getRawTag(value)
      : _objectToString(value);
  }

  var _baseGetTag = baseGetTag;

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject$1(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  var isObject_1 = isObject$1;

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject_1(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = _baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  var isFunction_1 = isFunction;

  /** Used to detect overreaching core-js shims. */
  var coreJsData = _root['__core-js_shared__'];

  var _coreJsData = coreJsData;

  /** Used to detect methods masquerading as native. */
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }

  var _isMasked = isMasked;

  /** Used for built-in method references. */
  var funcProto = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  var _toSource = toSource;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var funcProto$1 = Function.prototype,
      objectProto$2 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1 = funcProto$1.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2 = objectProto$2.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative = RegExp('^' +
    funcToString$1.call(hasOwnProperty$2).replace(reRegExpChar, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative(value) {
    if (!isObject_1(value) || _isMasked(value)) {
      return false;
    }
    var pattern = isFunction_1(value) ? reIsNative : reIsHostCtor;
    return pattern.test(_toSource(value));
  }

  var _baseIsNative = baseIsNative;

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  var _getValue = getValue;

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative(object, key) {
    var value = _getValue(object, key);
    return _baseIsNative(value) ? value : undefined;
  }

  var _getNative = getNative;

  /* Built-in method references that are verified to be native. */
  var Map$1 = _getNative(_root, 'Map');

  var _Map = Map$1;

  /* Built-in method references that are verified to be native. */
  var nativeCreate = _getNative(Object, 'create');

  var _nativeCreate = nativeCreate;

  /**
   * Removes all key-value entries from the hash.
   *
   * @private
   * @name clear
   * @memberOf Hash
   */
  function hashClear() {
    this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
    this.size = 0;
  }

  var _hashClear = hashClear;

  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  var _hashDelete = hashDelete;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /** Used for built-in method references. */
  var objectProto$3 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3 = objectProto$3.hasOwnProperty;

  /**
   * Gets the hash value for `key`.
   *
   * @private
   * @name get
   * @memberOf Hash
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function hashGet(key) {
    var data = this.__data__;
    if (_nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty$3.call(data, key) ? data[key] : undefined;
  }

  var _hashGet = hashGet;

  /** Used for built-in method references. */
  var objectProto$4 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4 = objectProto$4.hasOwnProperty;

  /**
   * Checks if a hash value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Hash
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function hashHas(key) {
    var data = this.__data__;
    return _nativeCreate ? (data[key] !== undefined) : hasOwnProperty$4.call(data, key);
  }

  var _hashHas = hashHas;

  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED$1 = '__lodash_hash_undefined__';

  /**
   * Sets the hash `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Hash
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the hash instance.
   */
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = (_nativeCreate && value === undefined) ? HASH_UNDEFINED$1 : value;
    return this;
  }

  var _hashSet = hashSet;

  /**
   * Creates a hash object.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Hash(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `Hash`.
  Hash.prototype.clear = _hashClear;
  Hash.prototype['delete'] = _hashDelete;
  Hash.prototype.get = _hashGet;
  Hash.prototype.has = _hashHas;
  Hash.prototype.set = _hashSet;

  var _Hash = Hash;

  /**
   * Removes all key-value entries from the map.
   *
   * @private
   * @name clear
   * @memberOf MapCache
   */
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new _Hash,
      'map': new (_Map || _ListCache),
      'string': new _Hash
    };
  }

  var _mapCacheClear = mapCacheClear;

  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
      ? (value !== '__proto__')
      : (value === null);
  }

  var _isKeyable = isKeyable;

  /**
   * Gets the data for `map`.
   *
   * @private
   * @param {Object} map The map to query.
   * @param {string} key The reference key.
   * @returns {*} Returns the map data.
   */
  function getMapData(map, key) {
    var data = map.__data__;
    return _isKeyable(key)
      ? data[typeof key == 'string' ? 'string' : 'hash']
      : data.map;
  }

  var _getMapData = getMapData;

  /**
   * Removes `key` and its value from the map.
   *
   * @private
   * @name delete
   * @memberOf MapCache
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function mapCacheDelete(key) {
    var result = _getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }

  var _mapCacheDelete = mapCacheDelete;

  /**
   * Gets the map value for `key`.
   *
   * @private
   * @name get
   * @memberOf MapCache
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function mapCacheGet(key) {
    return _getMapData(this, key).get(key);
  }

  var _mapCacheGet = mapCacheGet;

  /**
   * Checks if a map value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf MapCache
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function mapCacheHas(key) {
    return _getMapData(this, key).has(key);
  }

  var _mapCacheHas = mapCacheHas;

  /**
   * Sets the map `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf MapCache
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the map cache instance.
   */
  function mapCacheSet(key, value) {
    var data = _getMapData(this, key),
        size = data.size;

    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }

  var _mapCacheSet = mapCacheSet;

  /**
   * Creates a map cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;

    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }

  // Add methods to `MapCache`.
  MapCache.prototype.clear = _mapCacheClear;
  MapCache.prototype['delete'] = _mapCacheDelete;
  MapCache.prototype.get = _mapCacheGet;
  MapCache.prototype.has = _mapCacheHas;
  MapCache.prototype.set = _mapCacheSet;

  var _MapCache = MapCache;

  /** Used as the size to enable large array optimizations. */
  var LARGE_ARRAY_SIZE = 200;

  /**
   * Sets the stack `key` to `value`.
   *
   * @private
   * @name set
   * @memberOf Stack
   * @param {string} key The key of the value to set.
   * @param {*} value The value to set.
   * @returns {Object} Returns the stack cache instance.
   */
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof _ListCache) {
      var pairs = data.__data__;
      if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new _MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }

  var _stackSet = stackSet;

  /**
   * Creates a stack cache object to store key-value pairs.
   *
   * @private
   * @constructor
   * @param {Array} [entries] The key-value pairs to cache.
   */
  function Stack(entries) {
    var data = this.__data__ = new _ListCache(entries);
    this.size = data.size;
  }

  // Add methods to `Stack`.
  Stack.prototype.clear = _stackClear;
  Stack.prototype['delete'] = _stackDelete;
  Stack.prototype.get = _stackGet;
  Stack.prototype.has = _stackHas;
  Stack.prototype.set = _stackSet;

  var _Stack = Stack;

  var defineProperty$3 = (function() {
    try {
      var func = _getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());

  var _defineProperty$1 = defineProperty$3;

  /**
   * The base implementation of `assignValue` and `assignMergeValue` without
   * value checks.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && _defineProperty$1) {
      _defineProperty$1(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }

  var _baseAssignValue = baseAssignValue;

  /**
   * This function is like `assignValue` except that it doesn't assign
   * `undefined` values.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignMergeValue(object, key, value) {
    if ((value !== undefined && !eq_1(object[key], value)) ||
        (value === undefined && !(key in object))) {
      _baseAssignValue(object, key, value);
    }
  }

  var _assignMergeValue = assignMergeValue;

  /**
   * Creates a base function for methods like `_.forIn` and `_.forOwn`.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new base function.
   */
  function createBaseFor(fromRight) {
    return function(object, iteratee, keysFunc) {
      var index = -1,
          iterable = Object(object),
          props = keysFunc(object),
          length = props.length;

      while (length--) {
        var key = props[fromRight ? length : ++index];
        if (iteratee(iterable[key], key, iterable) === false) {
          break;
        }
      }
      return object;
    };
  }

  var _createBaseFor = createBaseFor;

  /**
   * The base implementation of `baseForOwn` which iterates over `object`
   * properties returned by `keysFunc` and invokes `iteratee` for each property.
   * Iteratee functions may exit iteration early by explicitly returning `false`.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} iteratee The function invoked per iteration.
   * @param {Function} keysFunc The function to get the keys of `object`.
   * @returns {Object} Returns `object`.
   */
  var baseFor = _createBaseFor();

  var _baseFor = baseFor;

  var _cloneBuffer = createCommonjsModule$1(function (module, exports) {
  /** Detect free variable `exports`. */
  var freeExports =  exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Built-in value references. */
  var Buffer = moduleExports ? _root.Buffer : undefined,
      allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;

  /**
   * Creates a clone of  `buffer`.
   *
   * @private
   * @param {Buffer} buffer The buffer to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Buffer} Returns the cloned buffer.
   */
  function cloneBuffer(buffer, isDeep) {
    if (isDeep) {
      return buffer.slice();
    }
    var length = buffer.length,
        result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

    buffer.copy(result);
    return result;
  }

  module.exports = cloneBuffer;
  });

  /** Built-in value references. */
  var Uint8Array$1 = _root.Uint8Array;

  var _Uint8Array = Uint8Array$1;

  /**
   * Creates a clone of `arrayBuffer`.
   *
   * @private
   * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
   * @returns {ArrayBuffer} Returns the cloned array buffer.
   */
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
    return result;
  }

  var _cloneArrayBuffer = cloneArrayBuffer;

  /**
   * Creates a clone of `typedArray`.
   *
   * @private
   * @param {Object} typedArray The typed array to clone.
   * @param {boolean} [isDeep] Specify a deep clone.
   * @returns {Object} Returns the cloned typed array.
   */
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }

  var _cloneTypedArray = cloneTypedArray;

  /**
   * Copies the values of `source` to `array`.
   *
   * @private
   * @param {Array} source The array to copy values from.
   * @param {Array} [array=[]] The array to copy values to.
   * @returns {Array} Returns `array`.
   */
  function copyArray(source, array) {
    var index = -1,
        length = source.length;

    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }

  var _copyArray = copyArray;

  /** Built-in value references. */
  var objectCreate = Object.create;

  /**
   * The base implementation of `_.create` without support for assigning
   * properties to the created object.
   *
   * @private
   * @param {Object} proto The object to inherit from.
   * @returns {Object} Returns the new object.
   */
  var baseCreate = (function() {
    function object() {}
    return function(proto) {
      if (!isObject_1(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object;
      object.prototype = undefined;
      return result;
    };
  }());

  var _baseCreate = baseCreate;

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  var _overArg = overArg;

  /** Built-in value references. */
  var getPrototype = _overArg(Object.getPrototypeOf, Object);

  var _getPrototype = getPrototype;

  /** Used for built-in method references. */
  var objectProto$5 = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$5;

    return value === proto;
  }

  var _isPrototype = isPrototype;

  /**
   * Initializes an object clone.
   *
   * @private
   * @param {Object} object The object to clone.
   * @returns {Object} Returns the initialized clone.
   */
  function initCloneObject(object) {
    return (typeof object.constructor == 'function' && !_isPrototype(object))
      ? _baseCreate(_getPrototype(object))
      : {};
  }

  var _initCloneObject = initCloneObject;

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  var isObjectLike_1 = isObjectLike;

  /** `Object#toString` result references. */
  var argsTag = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments(value) {
    return isObjectLike_1(value) && _baseGetTag(value) == argsTag;
  }

  var _baseIsArguments = baseIsArguments;

  /** Used for built-in method references. */
  var objectProto$6 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5 = objectProto$6.hasOwnProperty;

  /** Built-in value references. */
  var propertyIsEnumerable = objectProto$6.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
    return isObjectLike_1(value) && hasOwnProperty$5.call(value, 'callee') &&
      !propertyIsEnumerable.call(value, 'callee');
  };

  var isArguments_1 = isArguments;

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  var isArray_1 = isArray;

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  var isLength_1 = isLength;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength_1(value.length) && !isFunction_1(value);
  }

  var isArrayLike_1 = isArrayLike;

  /**
   * This method is like `_.isArrayLike` except that it also checks if `value`
   * is an object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array-like object,
   *  else `false`.
   * @example
   *
   * _.isArrayLikeObject([1, 2, 3]);
   * // => true
   *
   * _.isArrayLikeObject(document.body.children);
   * // => true
   *
   * _.isArrayLikeObject('abc');
   * // => false
   *
   * _.isArrayLikeObject(_.noop);
   * // => false
   */
  function isArrayLikeObject(value) {
    return isObjectLike_1(value) && isArrayLike_1(value);
  }

  var isArrayLikeObject_1 = isArrayLikeObject;

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false;
  }

  var stubFalse_1 = stubFalse;

  var isBuffer_1 = createCommonjsModule$1(function (module, exports) {
  /** Detect free variable `exports`. */
  var freeExports =  exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Built-in value references. */
  var Buffer = moduleExports ? _root.Buffer : undefined;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = nativeIsBuffer || stubFalse_1;

  module.exports = isBuffer;
  });

  /** `Object#toString` result references. */
  var objectTag = '[object Object]';

  /** Used for built-in method references. */
  var funcProto$2 = Function.prototype,
      objectProto$7 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$2 = funcProto$2.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$6 = objectProto$7.hasOwnProperty;

  /** Used to infer the `Object` constructor. */
  var objectCtorString = funcToString$2.call(Object);

  /**
   * Checks if `value` is a plain object, that is, an object created by the
   * `Object` constructor or one with a `[[Prototype]]` of `null`.
   *
   * @static
   * @memberOf _
   * @since 0.8.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * _.isPlainObject(new Foo);
   * // => false
   *
   * _.isPlainObject([1, 2, 3]);
   * // => false
   *
   * _.isPlainObject({ 'x': 0, 'y': 0 });
   * // => true
   *
   * _.isPlainObject(Object.create(null));
   * // => true
   */
  function isPlainObject(value) {
    if (!isObjectLike_1(value) || _baseGetTag(value) != objectTag) {
      return false;
    }
    var proto = _getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty$6.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor == 'function' && Ctor instanceof Ctor &&
      funcToString$2.call(Ctor) == objectCtorString;
  }

  var isPlainObject_1 = isPlainObject;

  /** `Object#toString` result references. */
  var argsTag$1 = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag$1 = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag$1 = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';

  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
  typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
  typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
  typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
  typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag$1] = typedArrayTags[arrayTag] =
  typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
  typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
  typedArrayTags[errorTag] = typedArrayTags[funcTag$1] =
  typedArrayTags[mapTag] = typedArrayTags[numberTag] =
  typedArrayTags[objectTag$1] = typedArrayTags[regexpTag] =
  typedArrayTags[setTag] = typedArrayTags[stringTag] =
  typedArrayTags[weakMapTag] = false;

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray(value) {
    return isObjectLike_1(value) &&
      isLength_1(value.length) && !!typedArrayTags[_baseGetTag(value)];
  }

  var _baseIsTypedArray = baseIsTypedArray;

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }

  var _baseUnary = baseUnary;

  var _nodeUtil = createCommonjsModule$1(function (module, exports) {
  /** Detect free variable `exports`. */
  var freeExports =  exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports && _freeGlobal.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      // Use `util.types` for Node.js 10+.
      var types = freeModule && freeModule.require && freeModule.require('util').types;

      if (types) {
        return types;
      }

      // Legacy `process.binding('util')` for Node.js < 10.
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  module.exports = nodeUtil;
  });

  /* Node.js helper references. */
  var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

  var isTypedArray_1 = isTypedArray;

  /**
   * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function safeGet(object, key) {
    if (key === 'constructor' && typeof object[key] === 'function') {
      return;
    }

    if (key == '__proto__') {
      return;
    }

    return object[key];
  }

  var _safeGet = safeGet;

  /** Used for built-in method references. */
  var objectProto$8 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$7 = objectProto$8.hasOwnProperty;

  /**
   * Assigns `value` to `key` of `object` if the existing value is not equivalent
   * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * for equality comparisons.
   *
   * @private
   * @param {Object} object The object to modify.
   * @param {string} key The key of the property to assign.
   * @param {*} value The value to assign.
   */
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty$7.call(object, key) && eq_1(objValue, value)) ||
        (value === undefined && !(key in object))) {
      _baseAssignValue(object, key, value);
    }
  }

  var _assignValue = assignValue;

  /**
   * Copies properties of `source` to `object`.
   *
   * @private
   * @param {Object} source The object to copy properties from.
   * @param {Array} props The property identifiers to copy.
   * @param {Object} [object={}] The object to copy properties to.
   * @param {Function} [customizer] The function to customize copied values.
   * @returns {Object} Returns `object`.
   */
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});

    var index = -1,
        length = props.length;

    while (++index < length) {
      var key = props[index];

      var newValue = customizer
        ? customizer(object[key], source[key], key, object, source)
        : undefined;

      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        _baseAssignValue(object, key, newValue);
      } else {
        _assignValue(object, key, newValue);
      }
    }
    return object;
  }

  var _copyObject = copyObject;

  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  var _baseTimes = baseTimes;

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER$1 : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  var _isIndex = isIndex;

  /** Used for built-in method references. */
  var objectProto$9 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$8 = objectProto$9.hasOwnProperty;

  /**
   * Creates an array of the enumerable property names of the array-like `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @param {boolean} inherited Specify returning inherited property names.
   * @returns {Array} Returns the array of property names.
   */
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray_1(value),
        isArg = !isArr && isArguments_1(value),
        isBuff = !isArr && !isArg && isBuffer_1(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray_1(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? _baseTimes(value.length, String) : [],
        length = result.length;

    for (var key in value) {
      if ((inherited || hasOwnProperty$8.call(value, key)) &&
          !(skipIndexes && (
             // Safari 9 has enumerable `arguments.length` in strict mode.
             key == 'length' ||
             // Node.js 0.10 has enumerable non-index properties on buffers.
             (isBuff && (key == 'offset' || key == 'parent')) ||
             // PhantomJS 2 has enumerable non-index properties on typed arrays.
             (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
             // Skip index properties.
             _isIndex(key, length)
          ))) {
        result.push(key);
      }
    }
    return result;
  }

  var _arrayLikeKeys = arrayLikeKeys;

  /**
   * This function is like
   * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * except that it includes inherited enumerable properties.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }

  var _nativeKeysIn = nativeKeysIn;

  /** Used for built-in method references. */
  var objectProto$a = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$9 = objectProto$a.hasOwnProperty;

  /**
   * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeysIn(object) {
    if (!isObject_1(object)) {
      return _nativeKeysIn(object);
    }
    var isProto = _isPrototype(object),
        result = [];

    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty$9.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeysIn = baseKeysIn;

  /**
   * Creates an array of the own and inherited enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keysIn(new Foo);
   * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
   */
  function keysIn(object) {
    return isArrayLike_1(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
  }

  var keysIn_1 = keysIn;

  /**
   * Converts `value` to a plain object flattening inherited enumerable string
   * keyed properties of `value` to own properties of the plain object.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {Object} Returns the converted plain object.
   * @example
   *
   * function Foo() {
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.assign({ 'a': 1 }, new Foo);
   * // => { 'a': 1, 'b': 2 }
   *
   * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
   * // => { 'a': 1, 'b': 2, 'c': 3 }
   */
  function toPlainObject(value) {
    return _copyObject(value, keysIn_1(value));
  }

  var toPlainObject_1 = toPlainObject;

  /**
   * A specialized version of `baseMerge` for arrays and objects which performs
   * deep merges and tracks traversed objects enabling objects with circular
   * references to be merged.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @param {string} key The key of the value to merge.
   * @param {number} srcIndex The index of `source`.
   * @param {Function} mergeFunc The function to merge values.
   * @param {Function} [customizer] The function to customize assigned values.
   * @param {Object} [stack] Tracks traversed source values and their merged
   *  counterparts.
   */
  function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
    var objValue = _safeGet(object, key),
        srcValue = _safeGet(source, key),
        stacked = stack.get(srcValue);

    if (stacked) {
      _assignMergeValue(object, key, stacked);
      return;
    }
    var newValue = customizer
      ? customizer(objValue, srcValue, (key + ''), object, source, stack)
      : undefined;

    var isCommon = newValue === undefined;

    if (isCommon) {
      var isArr = isArray_1(srcValue),
          isBuff = !isArr && isBuffer_1(srcValue),
          isTyped = !isArr && !isBuff && isTypedArray_1(srcValue);

      newValue = srcValue;
      if (isArr || isBuff || isTyped) {
        if (isArray_1(objValue)) {
          newValue = objValue;
        }
        else if (isArrayLikeObject_1(objValue)) {
          newValue = _copyArray(objValue);
        }
        else if (isBuff) {
          isCommon = false;
          newValue = _cloneBuffer(srcValue, true);
        }
        else if (isTyped) {
          isCommon = false;
          newValue = _cloneTypedArray(srcValue, true);
        }
        else {
          newValue = [];
        }
      }
      else if (isPlainObject_1(srcValue) || isArguments_1(srcValue)) {
        newValue = objValue;
        if (isArguments_1(objValue)) {
          newValue = toPlainObject_1(objValue);
        }
        else if (!isObject_1(objValue) || isFunction_1(objValue)) {
          newValue = _initCloneObject(srcValue);
        }
      }
      else {
        isCommon = false;
      }
    }
    if (isCommon) {
      // Recursively merge objects and arrays (susceptible to call stack limits).
      stack.set(srcValue, newValue);
      mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
      stack['delete'](srcValue);
    }
    _assignMergeValue(object, key, newValue);
  }

  var _baseMergeDeep = baseMergeDeep;

  /**
   * The base implementation of `_.merge` without support for multiple sources.
   *
   * @private
   * @param {Object} object The destination object.
   * @param {Object} source The source object.
   * @param {number} srcIndex The index of `source`.
   * @param {Function} [customizer] The function to customize merged values.
   * @param {Object} [stack] Tracks traversed source values and their merged
   *  counterparts.
   */
  function baseMerge(object, source, srcIndex, customizer, stack) {
    if (object === source) {
      return;
    }
    _baseFor(source, function(srcValue, key) {
      stack || (stack = new _Stack);
      if (isObject_1(srcValue)) {
        _baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
      }
      else {
        var newValue = customizer
          ? customizer(_safeGet(object, key), srcValue, (key + ''), object, source, stack)
          : undefined;

        if (newValue === undefined) {
          newValue = srcValue;
        }
        _assignMergeValue(object, key, newValue);
      }
    }, keysIn_1);
  }

  var _baseMerge = baseMerge;

  /**
   * This method returns the first argument it receives.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {*} value Any value.
   * @returns {*} Returns `value`.
   * @example
   *
   * var object = { 'a': 1 };
   *
   * console.log(_.identity(object) === object);
   * // => true
   */
  function identity(value) {
    return value;
  }

  var identity_1 = identity;

  /**
   * A faster alternative to `Function#apply`, this function invokes `func`
   * with the `this` binding of `thisArg` and the arguments of `args`.
   *
   * @private
   * @param {Function} func The function to invoke.
   * @param {*} thisArg The `this` binding of `func`.
   * @param {Array} args The arguments to invoke `func` with.
   * @returns {*} Returns the result of `func`.
   */
  function apply(func, thisArg, args) {
    switch (args.length) {
      case 0: return func.call(thisArg);
      case 1: return func.call(thisArg, args[0]);
      case 2: return func.call(thisArg, args[0], args[1]);
      case 3: return func.call(thisArg, args[0], args[1], args[2]);
    }
    return func.apply(thisArg, args);
  }

  var _apply = apply;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeMax = Math.max;

  /**
   * A specialized version of `baseRest` which transforms the rest array.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @param {Function} transform The rest array transform.
   * @returns {Function} Returns the new function.
   */
  function overRest(func, start, transform) {
    start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
    return function() {
      var args = arguments,
          index = -1,
          length = nativeMax(args.length - start, 0),
          array = Array(length);

      while (++index < length) {
        array[index] = args[start + index];
      }
      index = -1;
      var otherArgs = Array(start + 1);
      while (++index < start) {
        otherArgs[index] = args[index];
      }
      otherArgs[start] = transform(array);
      return _apply(func, this, otherArgs);
    };
  }

  var _overRest = overRest;

  /**
   * Creates a function that returns `value`.
   *
   * @static
   * @memberOf _
   * @since 2.4.0
   * @category Util
   * @param {*} value The value to return from the new function.
   * @returns {Function} Returns the new constant function.
   * @example
   *
   * var objects = _.times(2, _.constant({ 'a': 1 }));
   *
   * console.log(objects);
   * // => [{ 'a': 1 }, { 'a': 1 }]
   *
   * console.log(objects[0] === objects[1]);
   * // => true
   */
  function constant(value) {
    return function() {
      return value;
    };
  }

  var constant_1 = constant;

  /**
   * The base implementation of `setToString` without support for hot loop shorting.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var baseSetToString = !_defineProperty$1 ? identity_1 : function(func, string) {
    return _defineProperty$1(func, 'toString', {
      'configurable': true,
      'enumerable': false,
      'value': constant_1(string),
      'writable': true
    });
  };

  var _baseSetToString = baseSetToString;

  /** Used to detect hot functions by number of calls within a span of milliseconds. */
  var HOT_COUNT = 800,
      HOT_SPAN = 16;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeNow = Date.now;

  /**
   * Creates a function that'll short out and invoke `identity` instead
   * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
   * milliseconds.
   *
   * @private
   * @param {Function} func The function to restrict.
   * @returns {Function} Returns the new shortable function.
   */
  function shortOut(func) {
    var count = 0,
        lastCalled = 0;

    return function() {
      var stamp = nativeNow(),
          remaining = HOT_SPAN - (stamp - lastCalled);

      lastCalled = stamp;
      if (remaining > 0) {
        if (++count >= HOT_COUNT) {
          return arguments[0];
        }
      } else {
        count = 0;
      }
      return func.apply(undefined, arguments);
    };
  }

  var _shortOut = shortOut;

  /**
   * Sets the `toString` method of `func` to return `string`.
   *
   * @private
   * @param {Function} func The function to modify.
   * @param {Function} string The `toString` result.
   * @returns {Function} Returns `func`.
   */
  var setToString = _shortOut(_baseSetToString);

  var _setToString = setToString;

  /**
   * The base implementation of `_.rest` which doesn't validate or coerce arguments.
   *
   * @private
   * @param {Function} func The function to apply a rest parameter to.
   * @param {number} [start=func.length-1] The start position of the rest parameter.
   * @returns {Function} Returns the new function.
   */
  function baseRest(func, start) {
    return _setToString(_overRest(func, start, identity_1), func + '');
  }

  var _baseRest = baseRest;

  /**
   * Checks if the given arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
   *  else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!isObject_1(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
          ? (isArrayLike_1(object) && _isIndex(index, object.length))
          : (type == 'string' && index in object)
        ) {
      return eq_1(object[index], value);
    }
    return false;
  }

  var _isIterateeCall = isIterateeCall;

  /**
   * Creates a function like `_.assign`.
   *
   * @private
   * @param {Function} assigner The function to assign values.
   * @returns {Function} Returns the new assigner function.
   */
  function createAssigner(assigner) {
    return _baseRest(function(object, sources) {
      var index = -1,
          length = sources.length,
          customizer = length > 1 ? sources[length - 1] : undefined,
          guard = length > 2 ? sources[2] : undefined;

      customizer = (assigner.length > 3 && typeof customizer == 'function')
        ? (length--, customizer)
        : undefined;

      if (guard && _isIterateeCall(sources[0], sources[1], guard)) {
        customizer = length < 3 ? undefined : customizer;
        length = 1;
      }
      object = Object(object);
      while (++index < length) {
        var source = sources[index];
        if (source) {
          assigner(object, source, index, customizer);
        }
      }
      return object;
    });
  }

  var _createAssigner = createAssigner;

  /**
   * This method is like `_.assign` except that it recursively merges own and
   * inherited enumerable string keyed properties of source objects into the
   * destination object. Source properties that resolve to `undefined` are
   * skipped if a destination value exists. Array and plain object properties
   * are merged recursively. Other objects and value types are overridden by
   * assignment. Source objects are applied from left to right. Subsequent
   * sources overwrite property assignments of previous sources.
   *
   * **Note:** This method mutates `object`.
   *
   * @static
   * @memberOf _
   * @since 0.5.0
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @returns {Object} Returns `object`.
   * @example
   *
   * var object = {
   *   'a': [{ 'b': 2 }, { 'd': 4 }]
   * };
   *
   * var other = {
   *   'a': [{ 'c': 3 }, { 'e': 5 }]
   * };
   *
   * _.merge(object, other);
   * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
   */
  var merge = _createAssigner(function(object, source, srcIndex) {
    _baseMerge(object, source, srcIndex);
  });

  var merge_1 = merge;

  // 19.1.2.3 / 15.2.3.7 Object.defineProperties(O, Properties)
  _export(_export.S + _export.F * !_descriptors, 'Object', { defineProperties: _objectDps });

  var $Object$2 = _core.Object;
  var defineProperties = function defineProperties(T, D) {
    return $Object$2.defineProperties(T, D);
  };

  var defineProperties$1 = defineProperties;

  // all object keys, includes non-enumerable and symbols



  var Reflect$1 = _global.Reflect;
  var _ownKeys = Reflect$1 && Reflect$1.ownKeys || function ownKeys(it) {
    var keys = _objectGopn.f(_anObject(it));
    var getSymbols = _objectGops.f;
    return getSymbols ? keys.concat(getSymbols(it)) : keys;
  };

  var _createProperty = function (object, index, value) {
    if (index in object) _objectDp.f(object, index, _propertyDesc(0, value));
    else object[index] = value;
  };

  // https://github.com/tc39/proposal-object-getownpropertydescriptors






  _export(_export.S, 'Object', {
    getOwnPropertyDescriptors: function getOwnPropertyDescriptors(object) {
      var O = _toIobject(object);
      var getDesc = _objectGopd.f;
      var keys = _ownKeys(O);
      var result = {};
      var i = 0;
      var key, desc;
      while (keys.length > i) {
        desc = getDesc(O, key = keys[i++]);
        if (desc !== undefined) _createProperty(result, key, desc);
      }
      return result;
    }
  });

  var getOwnPropertyDescriptors = _core.Object.getOwnPropertyDescriptors;

  var getOwnPropertyDescriptors$1 = getOwnPropertyDescriptors;

  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)

  var $getOwnPropertyDescriptor$1 = _objectGopd.f;

  _objectSap('getOwnPropertyDescriptor', function () {
    return function getOwnPropertyDescriptor(it, key) {
      return $getOwnPropertyDescriptor$1(_toIobject(it), key);
    };
  });

  var $Object$3 = _core.Object;
  var getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
    return $Object$3.getOwnPropertyDescriptor(it, key);
  };

  var getOwnPropertyDescriptor$1 = getOwnPropertyDescriptor;

  var getOwnPropertySymbols = _core.Object.getOwnPropertySymbols;

  var getOwnPropertySymbols$1 = getOwnPropertySymbols;

  var _stringWs = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
    '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

  var space = '[' + _stringWs + ']';
  var non = '\u200b\u0085';
  var ltrim = RegExp('^' + space + space + '*');
  var rtrim = RegExp(space + space + '*$');

  var exporter = function (KEY, exec, ALIAS) {
    var exp = {};
    var FORCE = _fails(function () {
      return !!_stringWs[KEY]() || non[KEY]() != non;
    });
    var fn = exp[KEY] = FORCE ? exec(trim) : _stringWs[KEY];
    if (ALIAS) exp[ALIAS] = fn;
    _export(_export.P + _export.F * FORCE, 'String', exp);
  };

  // 1 -> String#trimLeft
  // 2 -> String#trimRight
  // 3 -> String#trim
  var trim = exporter.trim = function (string, TYPE) {
    string = String(_defined(string));
    if (TYPE & 1) string = string.replace(ltrim, '');
    if (TYPE & 2) string = string.replace(rtrim, '');
    return string;
  };

  var _stringTrim = exporter;

  var $parseInt = _global.parseInt;
  var $trim = _stringTrim.trim;

  var hex = /^[-+]?0[xX]/;

  var _parseInt = $parseInt(_stringWs + '08') !== 8 || $parseInt(_stringWs + '0x16') !== 22 ? function parseInt(str, radix) {
    var string = $trim(String(str), 3);
    return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
  } : $parseInt;

  // 18.2.5 parseInt(string, radix)
  _export(_export.G + _export.F * (parseInt != _parseInt), { parseInt: _parseInt });

  var _parseInt$1 = _core.parseInt;

  var _parseInt$2 = _parseInt$1;

  function _defineProperty$1$1(obj, key, value) {
    if (key in obj) {
      defineProperty$1$1(obj, key, {
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

  var defineProperty$4 = _defineProperty$1$1;

  // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)


  _export(_export.S, 'Array', { isArray: _isArray });

  var isArray$1 = _core.Array.isArray;

  var isArray$2 = isArray$1;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys = _overArg(Object.keys, Object);

  var _nativeKeys = nativeKeys;

  /** Used for built-in method references. */
  var objectProto$b = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$a = objectProto$b.hasOwnProperty;

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys(object) {
    if (!_isPrototype(object)) {
      return _nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$a.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeys = baseKeys;

  /**
   * Creates an array of the own enumerable property names of `object`.
   *
   * **Note:** Non-object values are coerced to objects. See the
   * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
   * for more details.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Object
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   *   this.b = 2;
   * }
   *
   * Foo.prototype.c = 3;
   *
   * _.keys(new Foo);
   * // => ['a', 'b'] (iteration order is not guaranteed)
   *
   * _.keys('hi');
   * // => ['0', '1']
   */
  function keys$2(object) {
    return isArrayLike_1(object) ? _arrayLikeKeys(object) : _baseKeys(object);
  }

  var keys_1 = keys$2;

  /** Used for built-in method references. */
  var objectProto$c = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$b = objectProto$c.hasOwnProperty;

  /**
   * Assigns own enumerable string keyed properties of source objects to the
   * destination object. Source objects are applied from left to right.
   * Subsequent sources overwrite property assignments of previous sources.
   *
   * **Note:** This method mutates `object` and is loosely based on
   * [`Object.assign`](https://mdn.io/Object/assign).
   *
   * @static
   * @memberOf _
   * @since 0.10.0
   * @category Object
   * @param {Object} object The destination object.
   * @param {...Object} [sources] The source objects.
   * @returns {Object} Returns `object`.
   * @see _.assignIn
   * @example
   *
   * function Foo() {
   *   this.a = 1;
   * }
   *
   * function Bar() {
   *   this.c = 3;
   * }
   *
   * Foo.prototype.b = 2;
   * Bar.prototype.d = 4;
   *
   * _.assign({ 'a': 0 }, new Foo, new Bar);
   * // => { 'a': 1, 'c': 3 }
   */
  var assign = _createAssigner(function(object, source) {
    if (_isPrototype(source) || isArrayLike_1(source)) {
      _copyObject(source, keys_1(source), object);
      return;
    }
    for (var key in source) {
      if (hasOwnProperty$b.call(source, key)) {
        _assignValue(object, key, source[key]);
      }
    }
  });

  var assign_1 = assign;

  function jsonSchema2api(){var newData=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},data=1<arguments.length&&arguments[1]!==void 0?arguments[1]:{},schema=2<arguments.length?arguments[2]:void 0;if(!schema)throw new Error("arguments[2](schema) is not defined!");if(!data||isArray$2(data)&&!data.length)return data;var fn={object:function object(){objectTransform(newData,data,schema);},array:function array(){arrayTransform(newData,data,schema);}}[schemaType(getType(data))];"function"==typeof fn&&fn();}function objectTransform(newData,data,schema){var dataKeys=keys$1(data),properties=schema.properties,schemaKeys=keys$1(properties);return 0>=dataKeys.length?newData:-1<schemaKeys.indexOf("any")?dataKeys.forEach(function(schemaKey){var serverName=schemaKey,dataVal=data[serverName],dataType=schemaType(getType(dataVal));if("object"===dataType||"array"===dataType){if(!properties.any.properties&&!properties.any.items)throw new Error("object array has not sub");return newData[schemaKey]={},"array"===dataType&&(newData[schemaKey]=[]),jsonSchema2api(newData[schemaKey],dataVal,properties.any)}-1<dataKeys.indexOf(serverName)&&(newData[schemaKey]=dataVal);}):void schemaKeys.forEach(function(schemaKey){var serverName=properties[schemaKey].serverName,dataVal=data[serverName],dataType=schemaType(getType(dataVal));if(null===dataVal)return newData[schemaKey]=dataVal,!0;if(properties[schemaKey].type!==dataType)throw new Error("server data [".concat(serverName,"] type not equal jsonSchema [").concat(schemaKey,"] type"));if("object"===dataType||"array"===dataType){if(!properties[schemaKey].properties&&!properties[schemaKey].items)throw new Error("object array has not sub");return newData[schemaKey]={},"array"===dataType&&(newData[schemaKey]=[]),jsonSchema2api(newData[schemaKey],dataVal,properties[schemaKey])}-1<dataKeys.indexOf(serverName)&&(newData[schemaKey]=dataVal);})}function arrayTransform(newData,data,schema){var subSchema=schema.items,schemaDType=subSchema.type;data.forEach(function(item,i){var serverItemType=schemaType(getType(item));if(newData[i]||("array"===serverItemType&&(newData[i]=[]),"object"===serverItemType&&(newData[i]={})),null===item)return newData[i]=item,!0;if("none"===serverItemType)throw new Error("api key type error");if(schemaDType!==serverItemType)throw new Error("api key type not match schema key type");return "object"===serverItemType||"array"===serverItemType?jsonSchema2api(newData[i],item,subSchema):void("other"===schemaDType&&(newData[i]=item))});}function schemaType(type){var getType={object:"object",array:"array",other:"other"}[type];return getType||(getType=function(type){return !!(-1<["number","string","boolean"].indexOf(type))&&"other"}(type)),getType||"none"}function getType(val){return Object.prototype.toString.call(val).slice(8,-1).toLowerCase()}

  // 19.1.2.17 Object.seal(O)

  var meta = _meta.onFreeze;

  _objectSap('seal', function ($seal) {
    return function seal(it) {
      return $seal && _isObject(it) ? $seal(meta(it)) : it;
    };
  });

  var seal = _core.Object.seal;

  var seal$1 = seal;

  // 19.1.2.7 Object.getOwnPropertyNames(O)
  _objectSap('getOwnPropertyNames', function () {
    return _objectGopnExt.f;
  });

  var $Object$4 = _core.Object;
  var getOwnPropertyNames = function getOwnPropertyNames(it) {
    return $Object$4.getOwnPropertyNames(it);
  };

  var getOwnPropertyNames$1 = getOwnPropertyNames;

  var lastRevokeFn=null,nProxy=null;function isObject$1$1(o){return !!o&&("object"==_typeof_1(o)||"function"==typeof o)}nProxy=function(target,handler){if(!isObject$1$1(target)||!isObject$1$1(handler))throw new TypeError("Cannot create proxy with a non-object as target or handler");var throwRevoked=function(){};lastRevokeFn=function(){throwRevoked=function(trap){throw new TypeError("Cannot perform '".concat(trap,"' on a proxy that has been revoked"))};};var unsafeHandler=handler;for(var k in handler={get:null,set:null,apply:null,construct:null},unsafeHandler){if(!(k in handler))throw new TypeError("nProxy polyfill does not support trap '".concat(k,"'"));handler[k]=unsafeHandler[k];}"function"==typeof unsafeHandler&&(handler.apply=unsafeHandler.apply.bind(unsafeHandler));var proxy=this,isMethod=!1,targetIsFunction="function"==typeof target;(handler.apply||handler.construct||targetIsFunction)&&(proxy=function(){var usingNew=this&&this.constructor===proxy,args=Array.prototype.slice.call(arguments);if(throwRevoked(usingNew?"construct":"apply"),usingNew&&handler.construct)return handler.construct.call(this,target,args);if(!usingNew&&handler.apply)return handler.apply(target,this,args);if(targetIsFunction){if(usingNew){args.unshift(target);var f=target.bind.apply(target,args);return new f}return target.apply(this,args)}throw new TypeError(usingNew?"not a constructor":"not a function")},isMethod=!0);var getter=handler.get?function(prop){return throwRevoked("get"),handler.get(this,prop,proxy)}:function(prop){return throwRevoked("get"),this[prop]},setter=handler.set?function(prop,value){throwRevoked("set");var status=handler.set(this,prop,value,proxy);}:function(prop,value){throwRevoked("set"),this[prop]=value;},propertyNames=getOwnPropertyNames$1(target),propertyMap={};propertyNames.forEach(function(prop){if(!(isMethod&&prop in proxy)){var real=getOwnPropertyDescriptor$1(target,prop),desc={enumerable:!!real.enumerable,get:getter.bind(target,prop),set:setter.bind(target,prop)};defineProperty$1$1(proxy,prop,desc),propertyMap[prop]=!0;}});var prototypeOk=!0;if(setPrototypeOf$1?setPrototypeOf$1(proxy,getPrototypeOf$1(target)):proxy.__proto__?proxy.__proto__=target.__proto__:prototypeOk=!1,handler.get||!prototypeOk)for(var _k in target)propertyMap[_k]||defineProperty$1$1(proxy,_k,{get:getter.bind(target,_k)});return seal$1(target),seal$1(proxy),proxy},nProxy.revocable=function(target,handler){var p=new nProxy(target,handler);return {proxy:p,revoke:lastRevokeFn}},nProxy.revocable=nProxy.revocable;var Proxy$1 = "undefined"==typeof Proxy?nProxy:Proxy;

  var reqConfig={url:"",method:"get",params:{},data:{},headers:{},timeout:1e3},https={aliapp:function aliapp(config){return new bluebird_1(function(resolve,reject){var data=config.data,nData=isArray$2(data)?[]:{},headers=config.headers,val="";keys$1(headers).forEach(function(header){"content-type"===header.toLowerCase()&&(val=headers[header]);}),"application/json"===val.toLowerCase()?nData=stringify$1$1(data):keys$1(data).forEach(function(item){nData[item]="object"===data[item].toString().slice(1,7).toLowerCase()?stringify$1$1(data[item]):data[item];});var opts={url:"".concat(config.url).concat(config.qs?"?".concat(config.qs):""),data:nData,headers:config.headers,method:config.method,timeout:config.timeout,success:function success(res){resolve({data:res.data,headers:res.headers,status:res.status,statusText:""});},fail:function fail(err){reject(err);}};"GET"===config.method.toUpperCase()&&delete opts.data,requestCallBack(config,my.request(opts));})},weapp:function weapp(config){return new bluebird_1(function(resolve,reject){var data=config.data,nData=isArray$2(data)?[]:{},headers=config.headers,val="";keys$1(headers).forEach(function(header){"content-type"===header.toLowerCase()&&(val=headers[header]);}),"application/x-www-form-urlencoded"===val.toLowerCase()?keys$1(data).forEach(function(item){nData[item]="object"===data[item].toString().slice(1,7).toLowerCase()?stringify$1$1(data[item]):data[item];}):nData=data;var opts={url:"".concat(config.url).concat(config.qs?"?".concat(config.qs):""),data:nData,header:config.headers,method:config.method,success:function success(res){200!=res.statusCode&&(res.data={retcode:5e3,info:{errCode:res.statusCode,msg:res.data,tip:res.data},data:{}}),resolve({data:res.data,headers:res.header,status:res.statusCode,statusText:""});},fail:function fail(err){reject(err);},complete:function complete(){}};"GET"===config.method.toUpperCase()&&delete opts.data,requestCallBack(config,wx.request(opts));})},swan:function(_swan){function swan(){return _swan.apply(this,arguments)}return swan.toString=function(){return _swan.toString()},swan}(function(config){return new bluebird_1(function(resolve,reject){var data=config.data,nData=isArray$2(data)?[]:{},headers=config.headers,val="";keys$1(headers).forEach(function(header){"content-type"===header.toLowerCase()&&(val=headers[header]);}),"application/x-www-form-urlencoded"===val.toLowerCase()?keys$1(data).forEach(function(item){nData[item]="object"===data[item].toString().slice(1,7).toLowerCase()?stringify$1$1(data[item]):data[item];}):nData=data;var opts={url:"".concat(config.url).concat(config.qs?"?".concat(config.qs):""),data:nData,header:config.headers,method:config.method,success:function success(res){200!=res.statusCode&&(res.data={retcode:5e3,info:{errCode:res.statusCode,msg:res.data,tip:res.data},data:{}}),resolve({data:res.data,headers:res.header,status:res.statusCode,statusText:""});},fail:function fail(err){reject(err);},complete:function complete(){}};"GET"===config.method.toUpperCase()&&delete opts.data,requestCallBack(config,swan.request(opts));})})};function requestCallBack(){var config=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},task=1<arguments.length?arguments[1]:void 0;config&&config.getRequestTask&&"function"==typeof config.getRequestTask&&config.getRequestTask(task);}function http(opts){if("function"!=typeof https[opts.env])throw new Error("http env error!");return https[opts.env](assign_1(reqConfig,opts))}

  function ownKeys(object,enumerableOnly){var keys=keys$1(object);return getOwnPropertySymbols$1&&keys.push.apply(keys,getOwnPropertySymbols$1(object)),enumerableOnly&&(keys=keys.filter(function(sym){return getOwnPropertyDescriptor$1(object,sym).enumerable})),keys}function _objectSpread(target){for(var source,i=1;i<arguments.length;i++)source=null==arguments[i]?{}:arguments[i],i%2?ownKeys(source,!0).forEach(function(key){defineProperty$4(target,key,source[key]);}):getOwnPropertyDescriptors$1?defineProperties$1(target,getOwnPropertyDescriptors$1(source)):ownKeys(source).forEach(function(key){defineProperty$1$1(target,key,getOwnPropertyDescriptor$1(source,key));});return target}var retcode={OK:"FE-200",PARAM:"FE-5000",OTHER:"FE-5001",CATCH:"FE-5002"};function generator(){var list=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},opts=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},_this=2<arguments.length&&void 0!==arguments[2]?arguments[2]:{},listKeys=list,isArray=isArray$2(list);return isArray||(listKeys=keys$1(list)),_this=this||_this,listKeys.forEach(function(item){var fnName=isArray?item.name:item,listVal=isArray?item:list[item];if(listVal.name=fnName,!fnName)throw new Error("Function name is required!");if(_this[fnName])throw new Error("Duplicate statements in _this: ".concat(fnName));_this[fnName]=function(conf){var fn=function(){var apiOpts=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},apiConfig=1<arguments.length?arguments[1]:void 0,cb=2<arguments.length&&void 0!==arguments[2]?arguments[2]:function(){};return apiOpts.fnName=fnName,apiOpts.openResInterceptor=apiOpts.openResInterceptor||opts.openResInterceptor,apiOpts.resInterceptor=apiOpts.resInterceptor||opts.resInterceptor,apiOpts.resSuccessCallback=apiOpts.resSuccessCallback||opts.resSuccessCallback,_this._before=_this._before||opts._before,apiConfig.url=apiOpts.url||apiConfig.url,"function"==typeof _this._before?_this._before(apiOpts,apiConfig,function(moreData){apiOpts=merge_1(apiOpts,moreData),serialize(apiOpts.data||{},apiConfig.params,function(retData){cb(retData,apiOpts);});}):void serialize(apiOpts.data||{},apiConfig.params,function(retData){cb(retData,apiOpts);})};return getProxy(fn,JSON.parse(stringify$1$1(getConfig(conf,opts,fn))))}(listVal),listVal=null;}),_this}function hasBaseURL(url){return /^((http:\/\/)|(https:\/\/)|(:\/\/))/.test(url)||/^(localhost)/.test(url)}function getConfig(conf,defaultConf,proxy){var apiConfig={url:"",baseURL:defaultConf.baseURL,env:defaultConf.env,headers:defaultConf.headers,timeout:defaultConf.timeout,method:conf.method||defaultConf.method,model:conf.resSchema||{},interval:conf.interval||0,retryTimes:conf.retryTimes||0,pathname:getPathname(conf.apiName),params:getParams(conf.params),fnName:conf.name,signKey:conf.signKey,status:"",statusText:""},apiName=urlParse(conf.apiName);return apiConfig.url=apiConfig.baseURL+apiConfig.pathname,hasBaseURL(conf.apiName)&&(apiConfig=assign_1(apiConfig,{baseURL:apiName.origin,pathname:getPathname(apiName.pathname),url:apiName.href})),keys$1(apiConfig).forEach(function(key){if(proxy[key])throw new Error("Duplicate statements in proxy Function: ".concat(key));proxy[key]=apiConfig[key];}),merge_1({},conf,apiConfig)}function getRestfulUrl(){var url=0<arguments.length&&arguments[0]!==void 0?arguments[0]:"",data=1<arguments.length&&arguments[1]!==void 0?arguments[1]:{},re=/\{(.+?)\}/g,result=null;do result=re.exec(url),result&&1<result.length&&(url=url.replace(result[0],data[result[1]]||""));while(result);return url}function getParams(params){function setData(item,method){return {required:!!item.isNeed,method:method.toUpperCase()}}var temp={},getParams=params.get||params.GET||[],postParams=params.post||params.POST||[];return getParams.forEach(function(item){temp[item.param]=setData(item,"GET");}),postParams.forEach(function(item){temp[item.param]=setData(item,"POST");}),temp}function serialize(data,vaild){var cb=2<arguments.length&&arguments[2]!==void 0?arguments[2]:function(){};setTimeout(function(){var retData={retcode:"FE-5000",errMsg:"",data:{}},qs=[],getData={},postData={},isVaild=keys$1(vaild).every(function(param){var item=vaild[param],method=item.method,required=item.required,val=data[param],vaildResult=isVaildFn(val,param,required);return vaildResult.result?!("undefined"!=typeof val&&null!=val)||("GET"===method.toUpperCase()?(getData[param]=val,qs.push("".concat(param,"=").concat(encodeURIComponent(val)))):postData[param]=val,!0):(retData.errMsg=vaildResult.errMsg,!1)});isVaild?(retData.retcode=retcode.OK,retData.data={qs:qs.join("&"),postData:postData,getData:getData}):retData.retcode=retcode.PARAM,cb(retData);},0);}function isVaildFn(val,key,required){return required&&(null===val||"undefined"==typeof val)?{result:!1,errMsg:"param: ".concat(key,". Is Required!")}:{result:!0,errMsg:""}}function getPathname(pathname){return /^\//.test(pathname)?pathname:"/".concat(pathname)}function getProxy(fn){var apiConfig=1<arguments.length&&arguments[1]!==void 0?arguments[1]:{};return new Proxy$1(fn,{get:function get(target,name){return apiConfig[name]},set:function set(){throw new Error("The property is readonly!")},apply:function apply(target,ctx,args){return new bluebird_1(function(resolve,reject){function request(reqData){++reqTime,target(reqData||{},apiConfig,function(retData,apiOpts){var data=retData.data;if(apiConfig=merge_1(apiConfig,{headers:apiOpts.headers,timeout:apiOpts.timeout,fnName:apiOpts.fnName}),apiOpts.err)return ctx.emit("cnfapi:res:reject",{fnName:apiOpts.fnName,retcode:apiOpts.err.retcode,msg:apiOpts.err.msg,headers:apiConfig.headers}),reject({retcode:apiOpts.err.retcode,msg:apiOpts.err.msg,headers:apiConfig.headers});if(retData.retcode!==retcode.OK)return ctx.emit("cnfapi:res:reject",{fnName:apiOpts.fnName,retcode:retData.retcode,msg:retData.errMsg,headers:apiConfig.headers}),reject({retcode:retData.retcode,msg:retData.errMsg,headers:apiConfig.headers});var reqUrl=apiConfig.url;apiOpts.restful&&(reqUrl=getRestfulUrl(reqUrl,apiOpts.restful)),ctx.emit("cnfapi:req:before",{fnName:apiOpts.fnName,url:reqUrl,timeout:apiConfig.timeout,env:apiConfig.env,method:apiConfig.method,headers:apiConfig.headers,data:data.postData,qs:data.qs,params:data.getData,getRequestTask:apiOpts.getRequestTask}),http({url:reqUrl,timeout:apiConfig.timeout,env:apiConfig.env,method:apiConfig.method,headers:apiConfig.headers,data:data.postData,qs:data.qs,params:data.getData,getRequestTask:apiOpts.getRequestTask}).then(function(res){var serverData=res.data;apiConfig.status=res.status,apiConfig.statusText=res.statusText;var isOpenResInterceptor="function"==typeof apiOpts.openResInterceptor&&apiOpts.openResInterceptor.call(apiConfig,serverData);if(isOpenResInterceptor&&reqTime<retryTimes+(retryTimes?1:2))return apiOpts.resInterceptor.call(apiConfig,serverData,function(err){var nOpts=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};if(err)return ctx.emit("cnfapi:res:reject",_objectSpread({fnName:apiOpts.fnName},err)),reject(err);var data=merge_1(reqData.data,nOpts.data),headers=merge_1(apiOpts.headers,nOpts.headers);reqData.data=data,apiOpts.headers=headers,request(reqData);});if("function"==typeof apiOpts.resSuccessCallback)return apiOpts.resSuccessCallback(serverData,function(err,resData){var retcode=2<arguments.length&&void 0!==arguments[2]?arguments[2]:200;return err?void(ctx.emit("cnfapi:res:reject",_objectSpread({fnName:apiOpts.fnName},err||fail({retcode:500,headers:res.headers}))),reject(err||fail({retcode:500,headers:res.headers}))):(reqTime=0,isEmpty(apiConfig.model)||(resData=modelFn(apiConfig.model,resData)),ctx.emit("cnfapi:res:resolve",_objectSpread({fnName:apiOpts.fnName},success({data:resData,headers:res.headers,retcode:retcode}))),resolve(success({data:resData,headers:res.headers,retcode:retcode})))});if(/^2\d/.test(+serverData.retcode)){reqTime=0;var _data=serverData.data;return isEmpty(apiConfig.model)||(_data=modelFn(apiConfig.model,_data)),ctx.emit("cnfapi:res:resolve",_objectSpread({fnName:apiOpts.fnName},success({data:_data,headers:res.headers,retcode:serverData.retcode}))),resolve(success({data:_data,headers:res.headers,retcode:serverData.retcode}))}ctx.emit("cnfapi:res:reject",_objectSpread({fnName:apiOpts.fnName},fail({retcode:serverData.retcode,msg:serverData.msg,headers:res.headers}))),reject(fail({retcode:serverData.retcode,msg:serverData.msg,headers:res.headers}));},function(err){var errJSONMsg=stringify$1$1(err);return errJSONMsg.toLowerCase().includes("abort")?(ctx.emit("cnfapi:res:reject",_objectSpread({fnName:apiOpts.fnName},fail({retcode:retcode.OTHER,msg:"error"===getType$1(err)?err.toString():stringify$1$1(err)}))),reject(fail({retcode:retcode.OTHER,msg:"error"===getType$1(err)?err.toString():stringify$1$1(err)}))):void retry(reqTime,retryTimes,interval,function(isEnd){return isEnd?(reqTime=0,ctx.emit("cnfapi:res:reject",_objectSpread({fnName:apiOpts.fnName},fail({retcode:retcode.OTHER,msg:"error"===getType$1(err)?err.toString():stringify$1$1(err)}))),reject(fail({retcode:retcode.OTHER,msg:"error"===getType$1(err)?err.toString():stringify$1$1(err)}))):void request(reqData)})})["catch"](function(catchErr){reqTime=0,ctx.emit("cnfapi:res:catch",_objectSpread({fnName:apiOpts.fnName},fail({retcode:retcode.CATCH,msg:"error"===getType$1(catchErr)?catchErr.toString():stringify$1$1(catchErr)}))),reject(fail({retcode:retcode.CATCH,msg:"error"===getType$1(catchErr)?catchErr.toString():stringify$1$1(catchErr)}));});});}function canRetryFn(interval,retryTimes){return !(isNaN(interval)||isNaN(retryTimes))&&(interval=_parseInt$2(interval),retryTimes=_parseInt$2(retryTimes),!(0>=interval||0>=retryTimes))}function retry(times,retryTimes,interval){var cb=3<arguments.length&&arguments[3]!==void 0?arguments[3]:function(){};return canRetryFn(interval,retryTimes)&&reqTime<=retryTimes?setTimeout(function(){cb(times>retryTimes);},interval):void cb(!0)}var _apiConfig=apiConfig,interval=_apiConfig.interval,_apiConfig2=apiConfig,retryTimes=_apiConfig2.retryTimes,reqTime=0;request(args[0]||{});})}})}function success(res){return {data:res.data,headers:res.headers,retcode:res.retcode}}function fail(res){return {retcode:res.retcode||"FE-5001",msg:res.msg||"unknown",headers:res.headers||{}}}function modelFn(schema,data){var feData=isArray$2(data)?[]:{};return jsonSchema2api(feData,data,schema),feData}function isEmpty(obj){return !obj||!keys$1(obj).length}function getType$1(val){return Object.prototype.toString.call(val).slice(8,-1).toLowerCase()}

  function _getType(val){return Object.prototype.toString.call(val).slice(8,-1).toLowerCase()}var Api=function(_EventEmitter){function Api(){var _this,conf=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},apiList=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};classCallCheck(this,Api),_this=possibleConstructorReturn(this,getPrototypeOf$2(Api).call(this));var listType=_this.getType(apiList);if("object"!==_this.getType(conf)||"object"!==listType&&"array"!==listType)throw new Error("constructor params require Object type");var _tempApiList=JSON.parse(stringify$1$1(apiList));return _this.merge=merge_1,_this.outConf=conf,defineProperty$1$1(assertThisInitialized(_this),"apiList",{get:function get(){return _tempApiList}}),_this.init(),_this}return inherits$2(Api,_EventEmitter),createClass(Api,[{key:"init",value:function init(){this.mergeConf(this.initConf,this.outConf),generator.apply(this,[JSON.parse(stringify$1$1(this.apiList)),this.defaultOpts]);}},{key:"mergeConf",value:function mergeConf(obj,sources){var _this2=this,temp={};if("object"!==this.getType(obj)||"object"!==this.getType(sources))throw new Error("mergeConf argument Not Object");return keys$1(obj).forEach(function(key){var val=obj[key],vaildResult=null,vaildFn=obj[key].vaildFn,defaultVal="function"==typeof obj[key]["default"]&&obj[key]["default"].apply(_this2)||"";if(val.required&&!defaultVal&&!sources[key])throw new Error("".concat(val.errMsg));if(temp[key]=sources[key]||defaultVal,"function"==typeof vaildFn&&(vaildResult=vaildFn(temp[key])),null!=vaildResult&&!vaildResult.result)throw new Error("".concat(vaildResult.errMsg))}),temp}},{key:"openResInterceptor",value:function openResInterceptor(){return this.conf.openResInterceptor.apply(this,arguments)}},{key:"_before",value:function _before(apiConf,cb){cb(apiConf);}},{key:"getType",value:function getType(val){return _getType(val)}},{key:"conf",get:function get(){return this.mergeConf(this.initConf,this.outConf)}},{key:"initConf",get:function get(){return {baseURL:{required:!0,errMsg:"baseURL is required",vaildFn:function vaildFn(val){return {result:/^((http:\/\/)|(https:\/\/)|(:\/\/))([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}(\/)?/.test(val)||/^((http:\/\/)|(https:\/\/)|(:\/\/))(localhost)/.test(val),errMsg:"invalid baseURL"}}},timeout:{required:!0,errMsg:"timeout is required or not 0",default:function _default(){return 3e3},vaildFn:function vaildFn(val){return {result:!isNaN(val)&&0!=val,errMsg:"invalid timeout"}}},env:{required:!0,errMsg:"invalid env",default:function _default(){return "browser"},vaildFn:function vaildFn(val){var resultObj={result:-1<["browser","aliapp","weapp","swan"].indexOf(val),errMsg:"invalid env, env must in [\"browser\", \"aliapp\" ,\"weapp\", \"swan\"]"};return ("aliapp"===val||"weapp"===val)&&(window=void 0,document=void 0),"browser"===val&&(resultObj={result:window&&document&&"undefined"!=typeof window&&"undefined"!=typeof document,errMsg:"invalid env, env not in browser, env must in [\"browser\", \"aliapp\" ,\"weapp\", \"swan\"]"}),resultObj}},openResInterceptor:{required:!1,default:function _default(){return function(){return !1}}},resInterceptor:{required:!1,default:function _default(){return function(){}}},resSuccessCallback:{required:!1,default:function _default(){return function(serverData,next){next(!1,serverData);}}},resFormat:{description:"\u63A5\u53E3\u8FD4\u56DE\u683C\u5F0F",required:!1,default:function _default(){return {type:"object",properties:{retcode:{type:"string"},msg:{type:"string"},data:{type:"object"}}}}}}}},{key:"defaultOpts",get:function get(){return this.merge({method:"GET",headers:{"Content-Type":"application/x-www-form-urlencoded"}},this.outConf,this.conf)}}]),Api}(EventEmitter);

  var minimalisticAssert = assert;

  function assert(val, msg) {
    if (!val)
      throw new Error(msg || 'Assertion failed');
  }

  assert.equal = function assertEqual(l, r, msg) {
    if (l != r)
      throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
  };

  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
  var inited = false;
  function init () {
    inited = true;
    var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    for (var i = 0, len = code.length; i < len; ++i) {
      lookup[i] = code[i];
      revLookup[code.charCodeAt(i)] = i;
    }

    revLookup['-'.charCodeAt(0)] = 62;
    revLookup['_'.charCodeAt(0)] = 63;
  }

  function toByteArray (b64) {
    if (!inited) {
      init();
    }
    var i, j, l, tmp, placeHolders, arr;
    var len = b64.length;

    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4')
    }

    // the number of equal signs (place holders)
    // if there are two placeholders, than the two characters before it
    // represent one byte
    // if there is only one, then the three characters before it represent 2 bytes
    // this is just a cheap hack to not do indexOf twice
    placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

    // base64 is 4/3 + up to two characters of the original data
    arr = new Arr(len * 3 / 4 - placeHolders);

    // if there are placeholders, only get up to the last complete 4 chars
    l = placeHolders > 0 ? len - 4 : len;

    var L = 0;

    for (i = 0, j = 0; i < l; i += 4, j += 3) {
      tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
      arr[L++] = (tmp >> 16) & 0xFF;
      arr[L++] = (tmp >> 8) & 0xFF;
      arr[L++] = tmp & 0xFF;
    }

    if (placeHolders === 2) {
      tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
      arr[L++] = tmp & 0xFF;
    } else if (placeHolders === 1) {
      tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
      arr[L++] = (tmp >> 8) & 0xFF;
      arr[L++] = tmp & 0xFF;
    }

    return arr
  }

  function tripletToBase64 (num) {
    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
  }

  function encodeChunk (uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
      output.push(tripletToBase64(tmp));
    }
    return output.join('')
  }

  function fromByteArray (uint8) {
    if (!inited) {
      init();
    }
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
    var output = '';
    var parts = [];
    var maxChunkLength = 16383; // must be multiple of 3

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      output += lookup[tmp >> 2];
      output += lookup[(tmp << 4) & 0x3F];
      output += '==';
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
      output += lookup[tmp >> 10];
      output += lookup[(tmp >> 4) & 0x3F];
      output += lookup[(tmp << 2) & 0x3F];
      output += '=';
    }

    parts.push(output);

    return parts.join('')
  }

  function read (buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? (nBytes - 1) : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];

    i += d;

    e = s & ((1 << (-nBits)) - 1);
    s >>= (-nBits);
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    m = e & ((1 << (-nBits)) - 1);
    e >>= (-nBits);
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : ((s ? -1 : 1) * Infinity)
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
  }

  function write (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
    var i = isLE ? 0 : (nBytes - 1);
    var d = isLE ? 1 : -1;
    var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

    value = Math.abs(value);

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

    e = (e << mLen) | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

    buffer[offset + i - d] |= s * 128;
  }

  var toString$2 = {}.toString;

  var isArray$3 = Array.isArray || function (arr) {
    return toString$2.call(arr) == '[object Array]';
  };

  var INSPECT_MAX_BYTES = 50;

  /**
   * If `Buffer.TYPED_ARRAY_SUPPORT`:
   *   === true    Use Uint8Array implementation (fastest)
   *   === false   Use Object implementation (most compatible, even IE6)
   *
   * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
   * Opera 11.6+, iOS 4.2+.
   *
   * Due to various browser bugs, sometimes the Object implementation will be used even
   * when the browser supports typed arrays.
   *
   * Note:
   *
   *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
   *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
   *
   *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
   *
   *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
   *     incorrect length in some situations.

   * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
   * get the Object implementation, which is slower but behaves correctly.
   */
  Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
    ? global$1.TYPED_ARRAY_SUPPORT
    : true;

  function kMaxLength () {
    return Buffer.TYPED_ARRAY_SUPPORT
      ? 0x7fffffff
      : 0x3fffffff
  }

  function createBuffer (that, length) {
    if (kMaxLength() < length) {
      throw new RangeError('Invalid typed array length')
    }
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      // Return an augmented `Uint8Array` instance, for best performance
      that = new Uint8Array(length);
      that.__proto__ = Buffer.prototype;
    } else {
      // Fallback: Return an object instance of the Buffer class
      if (that === null) {
        that = new Buffer(length);
      }
      that.length = length;
    }

    return that
  }

  /**
   * The Buffer constructor returns instances of `Uint8Array` that have their
   * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
   * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
   * and the `Uint8Array` methods. Square bracket notation works as expected -- it
   * returns a single octet.
   *
   * The `Uint8Array` prototype remains unmodified.
   */

  function Buffer (arg, encodingOrOffset, length) {
    if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
      return new Buffer(arg, encodingOrOffset, length)
    }

    // Common case.
    if (typeof arg === 'number') {
      if (typeof encodingOrOffset === 'string') {
        throw new Error(
          'If encoding is specified then the first argument must be a string'
        )
      }
      return allocUnsafe(this, arg)
    }
    return from(this, arg, encodingOrOffset, length)
  }

  Buffer.poolSize = 8192; // not used by this implementation

  // TODO: Legacy, not needed anymore. Remove in next major version.
  Buffer._augment = function (arr) {
    arr.__proto__ = Buffer.prototype;
    return arr
  };

  function from (that, value, encodingOrOffset, length) {
    if (typeof value === 'number') {
      throw new TypeError('"value" argument must not be a number')
    }

    if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
      return fromArrayBuffer(that, value, encodingOrOffset, length)
    }

    if (typeof value === 'string') {
      return fromString(that, value, encodingOrOffset)
    }

    return fromObject(that, value)
  }

  /**
   * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
   * if value is a number.
   * Buffer.from(str[, encoding])
   * Buffer.from(array)
   * Buffer.from(buffer)
   * Buffer.from(arrayBuffer[, byteOffset[, length]])
   **/
  Buffer.from = function (value, encodingOrOffset, length) {
    return from(null, value, encodingOrOffset, length)
  };

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    Buffer.prototype.__proto__ = Uint8Array.prototype;
    Buffer.__proto__ = Uint8Array;
  }

  function assertSize (size) {
    if (typeof size !== 'number') {
      throw new TypeError('"size" argument must be a number')
    } else if (size < 0) {
      throw new RangeError('"size" argument must not be negative')
    }
  }

  function alloc (that, size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(that, size)
    }
    if (fill !== undefined) {
      // Only pay attention to encoding if it's a string. This
      // prevents accidentally sending in a number that would
      // be interpretted as a start offset.
      return typeof encoding === 'string'
        ? createBuffer(that, size).fill(fill, encoding)
        : createBuffer(that, size).fill(fill)
    }
    return createBuffer(that, size)
  }

  /**
   * Creates a new filled Buffer instance.
   * alloc(size[, fill[, encoding]])
   **/
  Buffer.alloc = function (size, fill, encoding) {
    return alloc(null, size, fill, encoding)
  };

  function allocUnsafe (that, size) {
    assertSize(size);
    that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT) {
      for (var i = 0; i < size; ++i) {
        that[i] = 0;
      }
    }
    return that
  }

  /**
   * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
   * */
  Buffer.allocUnsafe = function (size) {
    return allocUnsafe(null, size)
  };
  /**
   * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
   */
  Buffer.allocUnsafeSlow = function (size) {
    return allocUnsafe(null, size)
  };

  function fromString (that, string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
      encoding = 'utf8';
    }

    if (!Buffer.isEncoding(encoding)) {
      throw new TypeError('"encoding" must be a valid string encoding')
    }

    var length = byteLength(string, encoding) | 0;
    that = createBuffer(that, length);

    var actual = that.write(string, encoding);

    if (actual !== length) {
      // Writing a hex string, for example, that contains invalid characters will
      // cause everything after the first invalid character to be ignored. (e.g.
      // 'abxxcd' will be treated as 'ab')
      that = that.slice(0, actual);
    }

    return that
  }

  function fromArrayLike (that, array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    that = createBuffer(that, length);
    for (var i = 0; i < length; i += 1) {
      that[i] = array[i] & 255;
    }
    return that
  }

  function fromArrayBuffer (that, array, byteOffset, length) {
    array.byteLength; // this throws if `array` is not a valid ArrayBuffer

    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('\'offset\' is out of bounds')
    }

    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('\'length\' is out of bounds')
    }

    if (byteOffset === undefined && length === undefined) {
      array = new Uint8Array(array);
    } else if (length === undefined) {
      array = new Uint8Array(array, byteOffset);
    } else {
      array = new Uint8Array(array, byteOffset, length);
    }

    if (Buffer.TYPED_ARRAY_SUPPORT) {
      // Return an augmented `Uint8Array` instance, for best performance
      that = array;
      that.__proto__ = Buffer.prototype;
    } else {
      // Fallback: Return an object instance of the Buffer class
      that = fromArrayLike(that, array);
    }
    return that
  }

  function fromObject (that, obj) {
    if (internalIsBuffer(obj)) {
      var len = checked(obj.length) | 0;
      that = createBuffer(that, len);

      if (that.length === 0) {
        return that
      }

      obj.copy(that, 0, 0, len);
      return that
    }

    if (obj) {
      if ((typeof ArrayBuffer !== 'undefined' &&
          obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
        if (typeof obj.length !== 'number' || isnan(obj.length)) {
          return createBuffer(that, 0)
        }
        return fromArrayLike(that, obj)
      }

      if (obj.type === 'Buffer' && isArray$3(obj.data)) {
        return fromArrayLike(that, obj.data)
      }
    }

    throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
  }

  function checked (length) {
    // Note: cannot use `length < kMaxLength()` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= kMaxLength()) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                           'size: 0x' + kMaxLength().toString(16) + ' bytes')
    }
    return length | 0
  }
  Buffer.isBuffer = isBuffer;
  function internalIsBuffer (b) {
    return !!(b != null && b._isBuffer)
  }

  Buffer.compare = function compare (a, b) {
    if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
      throw new TypeError('Arguments must be Buffers')
    }

    if (a === b) return 0

    var x = a.length;
    var y = b.length;

    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break
      }
    }

    if (x < y) return -1
    if (y < x) return 1
    return 0
  };

  Buffer.isEncoding = function isEncoding (encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'latin1':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true
      default:
        return false
    }
  };

  Buffer.concat = function concat (list, length) {
    if (!isArray$3(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }

    if (list.length === 0) {
      return Buffer.alloc(0)
    }

    var i;
    if (length === undefined) {
      length = 0;
      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }

    var buffer = Buffer.allocUnsafe(length);
    var pos = 0;
    for (i = 0; i < list.length; ++i) {
      var buf = list[i];
      if (!internalIsBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers')
      }
      buf.copy(buffer, pos);
      pos += buf.length;
    }
    return buffer
  };

  function byteLength (string, encoding) {
    if (internalIsBuffer(string)) {
      return string.length
    }
    if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
        (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
      return string.byteLength
    }
    if (typeof string !== 'string') {
      string = '' + string;
    }

    var len = string.length;
    if (len === 0) return 0

    // Use a for loop to avoid recursion
    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'ascii':
        case 'latin1':
        case 'binary':
          return len
        case 'utf8':
        case 'utf-8':
        case undefined:
          return utf8ToBytes(string).length
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2
        case 'hex':
          return len >>> 1
        case 'base64':
          return base64ToBytes(string).length
        default:
          if (loweredCase) return utf8ToBytes(string).length // assume utf8
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.byteLength = byteLength;

  function slowToString (encoding, start, end) {
    var loweredCase = false;

    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.

    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) {
      start = 0;
    }
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) {
      return ''
    }

    if (end === undefined || end > this.length) {
      end = this.length;
    }

    if (end <= 0) {
      return ''
    }

    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0;
    start >>>= 0;

    if (end <= start) {
      return ''
    }

    if (!encoding) encoding = 'utf8';

    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end)

        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end)

        case 'ascii':
          return asciiSlice(this, start, end)

        case 'latin1':
        case 'binary':
          return latin1Slice(this, start, end)

        case 'base64':
          return base64Slice(this, start, end)

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end)

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = (encoding + '').toLowerCase();
          loweredCase = true;
      }
    }
  }

  // The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
  // Buffer instances.
  Buffer.prototype._isBuffer = true;

  function swap (b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
  }

  Buffer.prototype.swap16 = function swap16 () {
    var len = this.length;
    if (len % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits')
    }
    for (var i = 0; i < len; i += 2) {
      swap(this, i, i + 1);
    }
    return this
  };

  Buffer.prototype.swap32 = function swap32 () {
    var len = this.length;
    if (len % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits')
    }
    for (var i = 0; i < len; i += 4) {
      swap(this, i, i + 3);
      swap(this, i + 1, i + 2);
    }
    return this
  };

  Buffer.prototype.swap64 = function swap64 () {
    var len = this.length;
    if (len % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits')
    }
    for (var i = 0; i < len; i += 8) {
      swap(this, i, i + 7);
      swap(this, i + 1, i + 6);
      swap(this, i + 2, i + 5);
      swap(this, i + 3, i + 4);
    }
    return this
  };

  Buffer.prototype.toString = function toString () {
    var length = this.length | 0;
    if (length === 0) return ''
    if (arguments.length === 0) return utf8Slice(this, 0, length)
    return slowToString.apply(this, arguments)
  };

  Buffer.prototype.equals = function equals (b) {
    if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
    if (this === b) return true
    return Buffer.compare(this, b) === 0
  };

  Buffer.prototype.inspect = function inspect () {
    var str = '';
    var max = INSPECT_MAX_BYTES;
    if (this.length > 0) {
      str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
      if (this.length > max) str += ' ... ';
    }
    return '<Buffer ' + str + '>'
  };

  Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
    if (!internalIsBuffer(target)) {
      throw new TypeError('Argument must be a Buffer')
    }

    if (start === undefined) {
      start = 0;
    }
    if (end === undefined) {
      end = target ? target.length : 0;
    }
    if (thisStart === undefined) {
      thisStart = 0;
    }
    if (thisEnd === undefined) {
      thisEnd = this.length;
    }

    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError('out of range index')
    }

    if (thisStart >= thisEnd && start >= end) {
      return 0
    }
    if (thisStart >= thisEnd) {
      return -1
    }
    if (start >= end) {
      return 1
    }

    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;

    if (this === target) return 0

    var x = thisEnd - thisStart;
    var y = end - start;
    var len = Math.min(x, y);

    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end);

    for (var i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break
      }
    }

    if (x < y) return -1
    if (y < x) return 1
    return 0
  };

  // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
  // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
  //
  // Arguments:
  // - buffer - a Buffer to search
  // - val - a string, Buffer, or number
  // - byteOffset - an index into `buffer`; will be clamped to an int32
  // - encoding - an optional encoding, relevant is val is a string
  // - dir - true for indexOf, false for lastIndexOf
  function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1

    // Normalize byteOffset
    if (typeof byteOffset === 'string') {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 0x7fffffff) {
      byteOffset = 0x7fffffff;
    } else if (byteOffset < -0x80000000) {
      byteOffset = -0x80000000;
    }
    byteOffset = +byteOffset;  // Coerce to Number.
    if (isNaN(byteOffset)) {
      // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
      byteOffset = dir ? 0 : (buffer.length - 1);
    }

    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
      if (dir) return -1
      else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0;
      else return -1
    }

    // Normalize val
    if (typeof val === 'string') {
      val = Buffer.from(val, encoding);
    }

    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if (internalIsBuffer(val)) {
      // Special case: looking for empty string/buffer always fails
      if (val.length === 0) {
        return -1
      }
      return arrayIndexOf$1(buffer, val, byteOffset, encoding, dir)
    } else if (typeof val === 'number') {
      val = val & 0xFF; // Search for a byte value [0-255]
      if (Buffer.TYPED_ARRAY_SUPPORT &&
          typeof Uint8Array.prototype.indexOf === 'function') {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
        }
      }
      return arrayIndexOf$1(buffer, [ val ], byteOffset, encoding, dir)
    }

    throw new TypeError('val must be string, number or Buffer')
  }

  function arrayIndexOf$1 (arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;

    if (encoding !== undefined) {
      encoding = String(encoding).toLowerCase();
      if (encoding === 'ucs2' || encoding === 'ucs-2' ||
          encoding === 'utf16le' || encoding === 'utf-16le') {
        if (arr.length < 2 || val.length < 2) {
          return -1
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }

    function read (buf, i) {
      if (indexSize === 1) {
        return buf[i]
      } else {
        return buf.readUInt16BE(i * indexSize)
      }
    }

    var i;
    if (dir) {
      var foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i;
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
        } else {
          if (foundIndex !== -1) i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        var found = true;
        for (var j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false;
            break
          }
        }
        if (found) return i
      }
    }

    return -1
  }

  Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1
  };

  Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
  };

  Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
  };

  function hexWrite (buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }

    // must be an even number of digits
    var strLen = string.length;
    if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (isNaN(parsed)) return i
      buf[offset + i] = parsed;
    }
    return i
  }

  function utf8Write (buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
  }

  function asciiWrite (buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length)
  }

  function latin1Write (buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length)
  }

  function base64Write (buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length)
  }

  function ucs2Write (buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
  }

  Buffer.prototype.write = function write (string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
      encoding = 'utf8';
      length = this.length;
      offset = 0;
    // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset;
      length = this.length;
      offset = 0;
    // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
      offset = offset | 0;
      if (isFinite(length)) {
        length = length | 0;
        if (encoding === undefined) encoding = 'utf8';
      } else {
        encoding = length;
        length = undefined;
      }
    // legacy write(string, encoding, offset, length) - remove in v0.13
    } else {
      throw new Error(
        'Buffer.write(string, encoding, offset[, length]) is no longer supported'
      )
    }

    var remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;

    if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds')
    }

    if (!encoding) encoding = 'utf8';

    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length)

        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length)

        case 'ascii':
          return asciiWrite(this, string, offset, length)

        case 'latin1':
        case 'binary':
          return latin1Write(this, string, offset, length)

        case 'base64':
          // Warning: maxLength not taken into account in base64Write
          return base64Write(this, string, offset, length)

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length)

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };

  Buffer.prototype.toJSON = function toJSON () {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    }
  };

  function base64Slice (buf, start, end) {
    if (start === 0 && end === buf.length) {
      return fromByteArray(buf)
    } else {
      return fromByteArray(buf.slice(start, end))
    }
  }

  function utf8Slice (buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];

    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = (firstByte > 0xEF) ? 4
        : (firstByte > 0xDF) ? 3
        : (firstByte > 0xBF) ? 2
        : 1;

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint;

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }
            break
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }
            break
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }
            break
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }
        }
      }

      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }

      res.push(codePoint);
      i += bytesPerSequence;
    }

    return decodeCodePointsArray(res)
  }

  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
  // the lowest limit is Chrome, with 0x10000 args.
  // We go 1 magnitude less, for safety
  var MAX_ARGUMENTS_LENGTH = 0x1000;

  function decodeCodePointsArray (codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
    }

    // Decode in chunks to avoid "call stack size exceeded".
    var res = '';
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(
        String,
        codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
      );
    }
    return res
  }

  function asciiSlice (buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7F);
    }
    return ret
  }

  function latin1Slice (buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret
  }

  function hexSlice (buf, start, end) {
    var len = buf.length;

    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;

    var out = '';
    for (var i = start; i < end; ++i) {
      out += toHex(buf[i]);
    }
    return out
  }

  function utf16leSlice (buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res
  }

  Buffer.prototype.slice = function slice (start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;

    if (start < 0) {
      start += len;
      if (start < 0) start = 0;
    } else if (start > len) {
      start = len;
    }

    if (end < 0) {
      end += len;
      if (end < 0) end = 0;
    } else if (end > len) {
      end = len;
    }

    if (end < start) end = start;

    var newBuf;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      newBuf = this.subarray(start, end);
      newBuf.__proto__ = Buffer.prototype;
    } else {
      var sliceLen = end - start;
      newBuf = new Buffer(sliceLen, undefined);
      for (var i = 0; i < sliceLen; ++i) {
        newBuf[i] = this[i + start];
      }
    }

    return newBuf
  };

  /*
   * Need to make sure that buffer isn't trying to write out of bounds.
   */
  function checkOffset (offset, ext, length) {
    if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
  }

  Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }

    return val
  };

  Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length);
    }

    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul;
    }

    return val
  };

  Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 1, this.length);
    return this[offset]
  };

  Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] | (this[offset + 1] << 8)
  };

  Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    return (this[offset] << 8) | this[offset + 1]
  };

  Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return ((this[offset]) |
        (this[offset + 1] << 8) |
        (this[offset + 2] << 16)) +
        (this[offset + 3] * 0x1000000)
  };

  Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] * 0x1000000) +
      ((this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      this[offset + 3])
  };

  Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val
  };

  Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val
  };

  Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80)) return (this[offset])
    return ((0xff - this[offset] + 1) * -1)
  };

  Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset] | (this[offset + 1] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  };

  Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | (this[offset] << 8);
    return (val & 0x8000) ? val | 0xFFFF0000 : val
  };

  Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16) |
      (this[offset + 3] << 24)
  };

  Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] << 24) |
      (this[offset + 1] << 16) |
      (this[offset + 2] << 8) |
      (this[offset + 3])
  };

  Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);
    return read(this, offset, true, 23, 4)
  };

  Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 4, this.length);
    return read(this, offset, false, 23, 4)
  };

  Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 8, this.length);
    return read(this, offset, true, 52, 8)
  };

  Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
    if (!noAssert) checkOffset(offset, 8, this.length);
    return read(this, offset, false, 52, 8)
  };

  function checkInt (buf, value, offset, ext, max, min) {
    if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
  }

  Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    byteLength = byteLength | 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = (value / mul) & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
    if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    this[offset] = (value & 0xff);
    return offset + 1
  };

  function objectWriteUInt16 (buf, value, offset, littleEndian) {
    if (value < 0) value = 0xffff + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
      buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
        (littleEndian ? i : 1 - i) * 8;
    }
  }

  Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2
  };

  Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2
  };

  function objectWriteUInt32 (buf, value, offset, littleEndian) {
    if (value < 0) value = 0xffffffff + value + 1;
    for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
      buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
    }
  }

  Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset + 3] = (value >>> 24);
      this[offset + 2] = (value >>> 16);
      this[offset + 1] = (value >>> 8);
      this[offset] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4
  };

  Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4
  };

  Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = 0;
    var mul = 1;
    var sub = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = byteLength - 1;
    var mul = 1;
    var sub = 0;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
    }

    return offset + byteLength
  };

  Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
    if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
    if (value < 0) value = 0xff + value + 1;
    this[offset] = (value & 0xff);
    return offset + 1
  };

  Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
    } else {
      objectWriteUInt16(this, value, offset, true);
    }
    return offset + 2
  };

  Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 8);
      this[offset + 1] = (value & 0xff);
    } else {
      objectWriteUInt16(this, value, offset, false);
    }
    return offset + 2
  };

  Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value & 0xff);
      this[offset + 1] = (value >>> 8);
      this[offset + 2] = (value >>> 16);
      this[offset + 3] = (value >>> 24);
    } else {
      objectWriteUInt32(this, value, offset, true);
    }
    return offset + 4
  };

  Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
    value = +value;
    offset = offset | 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (value < 0) value = 0xffffffff + value + 1;
    if (Buffer.TYPED_ARRAY_SUPPORT) {
      this[offset] = (value >>> 24);
      this[offset + 1] = (value >>> 16);
      this[offset + 2] = (value >>> 8);
      this[offset + 3] = (value & 0xff);
    } else {
      objectWriteUInt32(this, value, offset, false);
    }
    return offset + 4
  };

  function checkIEEE754 (buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError('Index out of range')
    if (offset < 0) throw new RangeError('Index out of range')
  }

  function writeFloat (buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4);
    }
    write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4
  }

  Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert)
  };

  Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert)
  };

  function writeDouble (buf, value, offset, littleEndian, noAssert) {
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8);
    }
    write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8
  }

  Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert)
  };

  Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert)
  };

  // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
  Buffer.prototype.copy = function copy (target, targetStart, start, end) {
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;

    // Copy 0 bytes; we're done
    if (end === start) return 0
    if (target.length === 0 || this.length === 0) return 0

    // Fatal error conditions
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds')
    }
    if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
    if (end < 0) throw new RangeError('sourceEnd out of bounds')

    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }

    var len = end - start;
    var i;

    if (this === target && start < targetStart && targetStart < end) {
      // descending copy from end
      for (i = len - 1; i >= 0; --i) {
        target[i + targetStart] = this[i + start];
      }
    } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
      // ascending copy from start
      for (i = 0; i < len; ++i) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      Uint8Array.prototype.set.call(
        target,
        this.subarray(start, start + len),
        targetStart
      );
    }

    return len
  };

  // Usage:
  //    buffer.fill(number[, offset[, end]])
  //    buffer.fill(buffer[, offset[, end]])
  //    buffer.fill(string[, offset[, end]][, encoding])
  Buffer.prototype.fill = function fill (val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === 'string') {
      if (typeof start === 'string') {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === 'string') {
        encoding = end;
        end = this.length;
      }
      if (val.length === 1) {
        var code = val.charCodeAt(0);
        if (code < 256) {
          val = code;
        }
      }
      if (encoding !== undefined && typeof encoding !== 'string') {
        throw new TypeError('encoding must be a string')
      }
      if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding)
      }
    } else if (typeof val === 'number') {
      val = val & 255;
    }

    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError('Out of range index')
    }

    if (end <= start) {
      return this
    }

    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;

    if (!val) val = 0;

    var i;
    if (typeof val === 'number') {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      var bytes = internalIsBuffer(val)
        ? val
        : utf8ToBytes(new Buffer(val, encoding).toString());
      var len = bytes.length;
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len];
      }
    }

    return this
  };

  // HELPER FUNCTIONS
  // ================

  var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

  function base64clean (str) {
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = stringtrim(str).replace(INVALID_BASE64_RE, '');
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return ''
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while (str.length % 4 !== 0) {
      str = str + '=';
    }
    return str
  }

  function stringtrim (str) {
    if (str.trim) return str.trim()
    return str.replace(/^\s+|\s+$/g, '')
  }

  function toHex (n) {
    if (n < 16) return '0' + n.toString(16)
    return n.toString(16)
  }

  function utf8ToBytes (string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];

    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);

      // is surrogate component
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue
          }

          // valid lead
          leadSurrogate = codePoint;

          continue
        }

        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue
        }

        // valid surrogate pair
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
      }

      leadSurrogate = null;

      // encode utf8
      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break
        bytes.push(
          codePoint >> 0x6 | 0xC0,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break
        bytes.push(
          codePoint >> 0xC | 0xE0,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break
        bytes.push(
          codePoint >> 0x12 | 0xF0,
          codePoint >> 0xC & 0x3F | 0x80,
          codePoint >> 0x6 & 0x3F | 0x80,
          codePoint & 0x3F | 0x80
        );
      } else {
        throw new Error('Invalid code point')
      }
    }

    return bytes
  }

  function asciiToBytes (str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      // Node's code seems to be doing this and not & 0x7F..
      byteArray.push(str.charCodeAt(i) & 0xFF);
    }
    return byteArray
  }

  function utf16leToBytes (str, units) {
    var c, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break

      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }

    return byteArray
  }


  function base64ToBytes (str) {
    return toByteArray(base64clean(str))
  }

  function blitBuffer (src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if ((i + offset >= dst.length) || (i >= src.length)) break
      dst[i + offset] = src[i];
    }
    return i
  }

  function isnan (val) {
    return val !== val // eslint-disable-line no-self-compare
  }


  // the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
  // The _isBuffer check is for Safari 5-7 support, because it's missing
  // Object.prototype.constructor. Remove this eventually
  function isBuffer(obj) {
    return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
  }

  function isFastBuffer (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
  }

  // For Node v0.10 support. Remove this eventually.
  function isSlowBuffer (obj) {
    return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
  }

  var inherits$3;
  if (typeof Object.create === 'function'){
    inherits$3 = function inherits(ctor, superCtor) {
      // implementation from standard node.js 'util' module
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    };
  } else {
    inherits$3 = function inherits(ctor, superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    };
  }
  var inherits$4 = inherits$3;

  var formatRegExp = /%[sdj%]/g;
  function format(f) {
    if (!isString(f)) {
      var objects = [];
      for (var i = 0; i < arguments.length; i++) {
        objects.push(inspect(arguments[i]));
      }
      return objects.join(' ');
    }

    var i = 1;
    var args = arguments;
    var len = args.length;
    var str = String(f).replace(formatRegExp, function(x) {
      if (x === '%%') return '%';
      if (i >= len) return x;
      switch (x) {
        case '%s': return String(args[i++]);
        case '%d': return Number(args[i++]);
        case '%j':
          try {
            return JSON.stringify(args[i++]);
          } catch (_) {
            return '[Circular]';
          }
        default:
          return x;
      }
    });
    for (var x = args[i]; i < len; x = args[++i]) {
      if (isNull(x) || !isObject$2(x)) {
        str += ' ' + x;
      } else {
        str += ' ' + inspect(x);
      }
    }
    return str;
  }

  // Mark that a method should not be used.
  // Returns a modified function which warns once by default.
  // If --no-deprecation is set, then it is a no-op.
  function deprecate(fn, msg) {
    // Allow for deprecating things in the process of starting up.
    if (isUndefined(global$1.process)) {
      return function() {
        return deprecate(fn, msg).apply(this, arguments);
      };
    }

    if (process.noDeprecation === true) {
      return fn;
    }

    var warned = false;
    function deprecated() {
      if (!warned) {
        if (process.throwDeprecation) {
          throw new Error(msg);
        } else if (process.traceDeprecation) {
          console.trace(msg);
        } else {
          console.error(msg);
        }
        warned = true;
      }
      return fn.apply(this, arguments);
    }

    return deprecated;
  }

  var debugs = {};
  var debugEnviron;
  function debuglog(set) {
    if (isUndefined(debugEnviron))
      debugEnviron = process.env.NODE_DEBUG || '';
    set = set.toUpperCase();
    if (!debugs[set]) {
      if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
        var pid = 0;
        debugs[set] = function() {
          var msg = format.apply(null, arguments);
          console.error('%s %d: %s', set, pid, msg);
        };
      } else {
        debugs[set] = function() {};
      }
    }
    return debugs[set];
  }

  /**
   * Echos the value of a value. Trys to print the value out
   * in the best way possible given the different types.
   *
   * @param {Object} obj The object to print out.
   * @param {Object} opts Optional options object that alters the output.
   */
  /* legacy: obj, showHidden, depth, colors*/
  function inspect(obj, opts) {
    // default options
    var ctx = {
      seen: [],
      stylize: stylizeNoColor
    };
    // legacy...
    if (arguments.length >= 3) ctx.depth = arguments[2];
    if (arguments.length >= 4) ctx.colors = arguments[3];
    if (isBoolean(opts)) {
      // legacy...
      ctx.showHidden = opts;
    } else if (opts) {
      // got an "options" object
      _extend(ctx, opts);
    }
    // set default options
    if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
    if (isUndefined(ctx.depth)) ctx.depth = 2;
    if (isUndefined(ctx.colors)) ctx.colors = false;
    if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
    if (ctx.colors) ctx.stylize = stylizeWithColor;
    return formatValue(ctx, obj, ctx.depth);
  }

  // http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
  inspect.colors = {
    'bold' : [1, 22],
    'italic' : [3, 23],
    'underline' : [4, 24],
    'inverse' : [7, 27],
    'white' : [37, 39],
    'grey' : [90, 39],
    'black' : [30, 39],
    'blue' : [34, 39],
    'cyan' : [36, 39],
    'green' : [32, 39],
    'magenta' : [35, 39],
    'red' : [31, 39],
    'yellow' : [33, 39]
  };

  // Don't use 'blue' not visible on cmd.exe
  inspect.styles = {
    'special': 'cyan',
    'number': 'yellow',
    'boolean': 'yellow',
    'undefined': 'grey',
    'null': 'bold',
    'string': 'green',
    'date': 'magenta',
    // "name": intentionally not styling
    'regexp': 'red'
  };


  function stylizeWithColor(str, styleType) {
    var style = inspect.styles[styleType];

    if (style) {
      return '\u001b[' + inspect.colors[style][0] + 'm' + str +
             '\u001b[' + inspect.colors[style][1] + 'm';
    } else {
      return str;
    }
  }


  function stylizeNoColor(str, styleType) {
    return str;
  }


  function arrayToHash(array) {
    var hash = {};

    array.forEach(function(val, idx) {
      hash[val] = true;
    });

    return hash;
  }


  function formatValue(ctx, value, recurseTimes) {
    // Provide a hook for user-specified inspect functions.
    // Check that value is an object with an inspect function on it
    if (ctx.customInspect &&
        value &&
        isFunction$1(value.inspect) &&
        // Filter out the util module, it's inspect function is special
        value.inspect !== inspect &&
        // Also filter out any prototype objects using the circular check.
        !(value.constructor && value.constructor.prototype === value)) {
      var ret = value.inspect(recurseTimes, ctx);
      if (!isString(ret)) {
        ret = formatValue(ctx, ret, recurseTimes);
      }
      return ret;
    }

    // Primitive types cannot have properties
    var primitive = formatPrimitive(ctx, value);
    if (primitive) {
      return primitive;
    }

    // Look up the keys of the object.
    var keys = Object.keys(value);
    var visibleKeys = arrayToHash(keys);

    if (ctx.showHidden) {
      keys = Object.getOwnPropertyNames(value);
    }

    // IE doesn't make error fields non-enumerable
    // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
    if (isError$1(value)
        && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
      return formatError(value);
    }

    // Some type of object without properties can be shortcutted.
    if (keys.length === 0) {
      if (isFunction$1(value)) {
        var name = value.name ? ': ' + value.name : '';
        return ctx.stylize('[Function' + name + ']', 'special');
      }
      if (isRegExp(value)) {
        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
      }
      if (isDate(value)) {
        return ctx.stylize(Date.prototype.toString.call(value), 'date');
      }
      if (isError$1(value)) {
        return formatError(value);
      }
    }

    var base = '', array = false, braces = ['{', '}'];

    // Make Array say that they are Array
    if (isArray$4(value)) {
      array = true;
      braces = ['[', ']'];
    }

    // Make functions say that they are functions
    if (isFunction$1(value)) {
      var n = value.name ? ': ' + value.name : '';
      base = ' [Function' + n + ']';
    }

    // Make RegExps say that they are RegExps
    if (isRegExp(value)) {
      base = ' ' + RegExp.prototype.toString.call(value);
    }

    // Make dates with properties first say the date
    if (isDate(value)) {
      base = ' ' + Date.prototype.toUTCString.call(value);
    }

    // Make error with message first say the error
    if (isError$1(value)) {
      base = ' ' + formatError(value);
    }

    if (keys.length === 0 && (!array || value.length == 0)) {
      return braces[0] + base + braces[1];
    }

    if (recurseTimes < 0) {
      if (isRegExp(value)) {
        return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
      } else {
        return ctx.stylize('[Object]', 'special');
      }
    }

    ctx.seen.push(value);

    var output;
    if (array) {
      output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
    } else {
      output = keys.map(function(key) {
        return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
      });
    }

    ctx.seen.pop();

    return reduceToSingleString(output, base, braces);
  }


  function formatPrimitive(ctx, value) {
    if (isUndefined(value))
      return ctx.stylize('undefined', 'undefined');
    if (isString(value)) {
      var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                               .replace(/'/g, "\\'")
                                               .replace(/\\"/g, '"') + '\'';
      return ctx.stylize(simple, 'string');
    }
    if (isNumber(value))
      return ctx.stylize('' + value, 'number');
    if (isBoolean(value))
      return ctx.stylize('' + value, 'boolean');
    // For some reason typeof null is "object", so special case here.
    if (isNull(value))
      return ctx.stylize('null', 'null');
  }


  function formatError(value) {
    return '[' + Error.prototype.toString.call(value) + ']';
  }


  function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
    var output = [];
    for (var i = 0, l = value.length; i < l; ++i) {
      if (hasOwnProperty$c(value, String(i))) {
        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
            String(i), true));
      } else {
        output.push('');
      }
    }
    keys.forEach(function(key) {
      if (!key.match(/^\d+$/)) {
        output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
            key, true));
      }
    });
    return output;
  }


  function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
    var name, str, desc;
    desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
    if (desc.get) {
      if (desc.set) {
        str = ctx.stylize('[Getter/Setter]', 'special');
      } else {
        str = ctx.stylize('[Getter]', 'special');
      }
    } else {
      if (desc.set) {
        str = ctx.stylize('[Setter]', 'special');
      }
    }
    if (!hasOwnProperty$c(visibleKeys, key)) {
      name = '[' + key + ']';
    }
    if (!str) {
      if (ctx.seen.indexOf(desc.value) < 0) {
        if (isNull(recurseTimes)) {
          str = formatValue(ctx, desc.value, null);
        } else {
          str = formatValue(ctx, desc.value, recurseTimes - 1);
        }
        if (str.indexOf('\n') > -1) {
          if (array) {
            str = str.split('\n').map(function(line) {
              return '  ' + line;
            }).join('\n').substr(2);
          } else {
            str = '\n' + str.split('\n').map(function(line) {
              return '   ' + line;
            }).join('\n');
          }
        }
      } else {
        str = ctx.stylize('[Circular]', 'special');
      }
    }
    if (isUndefined(name)) {
      if (array && key.match(/^\d+$/)) {
        return str;
      }
      name = JSON.stringify('' + key);
      if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
        name = name.substr(1, name.length - 2);
        name = ctx.stylize(name, 'name');
      } else {
        name = name.replace(/'/g, "\\'")
                   .replace(/\\"/g, '"')
                   .replace(/(^"|"$)/g, "'");
        name = ctx.stylize(name, 'string');
      }
    }

    return name + ': ' + str;
  }


  function reduceToSingleString(output, base, braces) {
    var length = output.reduce(function(prev, cur) {
      if (cur.indexOf('\n') >= 0) ;
      return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
    }, 0);

    if (length > 60) {
      return braces[0] +
             (base === '' ? '' : base + '\n ') +
             ' ' +
             output.join(',\n  ') +
             ' ' +
             braces[1];
    }

    return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
  }


  // NOTE: These type checking functions intentionally don't use `instanceof`
  // because it is fragile and can be easily faked with `Object.create()`.
  function isArray$4(ar) {
    return Array.isArray(ar);
  }

  function isBoolean(arg) {
    return typeof arg === 'boolean';
  }

  function isNull(arg) {
    return arg === null;
  }

  function isNullOrUndefined(arg) {
    return arg == null;
  }

  function isNumber(arg) {
    return typeof arg === 'number';
  }

  function isString(arg) {
    return typeof arg === 'string';
  }

  function isSymbol$1(arg) {
    return typeof arg === 'symbol';
  }

  function isUndefined(arg) {
    return arg === void 0;
  }

  function isRegExp(re) {
    return isObject$2(re) && objectToString$1(re) === '[object RegExp]';
  }

  function isObject$2(arg) {
    return typeof arg === 'object' && arg !== null;
  }

  function isDate(d) {
    return isObject$2(d) && objectToString$1(d) === '[object Date]';
  }

  function isError$1(e) {
    return isObject$2(e) &&
        (objectToString$1(e) === '[object Error]' || e instanceof Error);
  }

  function isFunction$1(arg) {
    return typeof arg === 'function';
  }

  function isPrimitive$1(arg) {
    return arg === null ||
           typeof arg === 'boolean' ||
           typeof arg === 'number' ||
           typeof arg === 'string' ||
           typeof arg === 'symbol' ||  // ES6 symbol
           typeof arg === 'undefined';
  }

  function isBuffer$1(maybeBuf) {
    return isBuffer(maybeBuf);
  }

  function objectToString$1(o) {
    return Object.prototype.toString.call(o);
  }


  function pad(n) {
    return n < 10 ? '0' + n.toString(10) : n.toString(10);
  }


  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
                'Oct', 'Nov', 'Dec'];

  // 26 Feb 16:19:34
  function timestamp() {
    var d = new Date();
    var time = [pad(d.getHours()),
                pad(d.getMinutes()),
                pad(d.getSeconds())].join(':');
    return [d.getDate(), months[d.getMonth()], time].join(' ');
  }


  // log is just a thin wrapper to console.log that prepends a timestamp
  function log() {
    console.log('%s - %s', timestamp(), format.apply(null, arguments));
  }

  function _extend(origin, add) {
    // Don't do anything if add isn't an object
    if (!add || !isObject$2(add)) return origin;

    var keys = Object.keys(add);
    var i = keys.length;
    while (i--) {
      origin[keys[i]] = add[keys[i]];
    }
    return origin;
  }
  function hasOwnProperty$c(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  var require$$0 = {
    inherits: inherits$4,
    _extend: _extend,
    log: log,
    isBuffer: isBuffer$1,
    isPrimitive: isPrimitive$1,
    isFunction: isFunction$1,
    isError: isError$1,
    isDate: isDate,
    isObject: isObject$2,
    isRegExp: isRegExp,
    isUndefined: isUndefined,
    isSymbol: isSymbol$1,
    isString: isString,
    isNumber: isNumber,
    isNullOrUndefined: isNullOrUndefined,
    isNull: isNull,
    isBoolean: isBoolean,
    isArray: isArray$4,
    inspect: inspect,
    deprecate: deprecate,
    format: format,
    debuglog: debuglog
  };

  var inherits_browser = createCommonjsModule(function (module) {
  if (typeof Object.create === 'function') {
    // implementation from standard node.js 'util' module
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        ctor.prototype = Object.create(superCtor.prototype, {
          constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
          }
        });
      }
    };
  } else {
    // old school shim for old browsers
    module.exports = function inherits(ctor, superCtor) {
      if (superCtor) {
        ctor.super_ = superCtor;
        var TempCtor = function () {};
        TempCtor.prototype = superCtor.prototype;
        ctor.prototype = new TempCtor();
        ctor.prototype.constructor = ctor;
      }
    };
  }
  });

  var inherits$5 = createCommonjsModule(function (module) {
  try {
    var util = require$$0;
    /* istanbul ignore next */
    if (typeof util.inherits !== 'function') throw '';
    module.exports = util.inherits;
  } catch (e) {
    /* istanbul ignore next */
    module.exports = inherits_browser;
  }
  });

  var inherits_1 = inherits$5;

  function isSurrogatePair(msg, i) {
    if ((msg.charCodeAt(i) & 0xFC00) !== 0xD800) {
      return false;
    }
    if (i < 0 || i + 1 >= msg.length) {
      return false;
    }
    return (msg.charCodeAt(i + 1) & 0xFC00) === 0xDC00;
  }

  function toArray(msg, enc) {
    if (Array.isArray(msg))
      return msg.slice();
    if (!msg)
      return [];
    var res = [];
    if (typeof msg === 'string') {
      if (!enc) {
        // Inspired by stringToUtf8ByteArray() in closure-library by Google
        // https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js#L117-L143
        // Apache License 2.0
        // https://github.com/google/closure-library/blob/master/LICENSE
        var p = 0;
        for (var i = 0; i < msg.length; i++) {
          var c = msg.charCodeAt(i);
          if (c < 128) {
            res[p++] = c;
          } else if (c < 2048) {
            res[p++] = (c >> 6) | 192;
            res[p++] = (c & 63) | 128;
          } else if (isSurrogatePair(msg, i)) {
            c = 0x10000 + ((c & 0x03FF) << 10) + (msg.charCodeAt(++i) & 0x03FF);
            res[p++] = (c >> 18) | 240;
            res[p++] = ((c >> 12) & 63) | 128;
            res[p++] = ((c >> 6) & 63) | 128;
            res[p++] = (c & 63) | 128;
          } else {
            res[p++] = (c >> 12) | 224;
            res[p++] = ((c >> 6) & 63) | 128;
            res[p++] = (c & 63) | 128;
          }
        }
      } else if (enc === 'hex') {
        msg = msg.replace(/[^a-z0-9]+/ig, '');
        if (msg.length % 2 !== 0)
          msg = '0' + msg;
        for (i = 0; i < msg.length; i += 2)
          res.push(parseInt(msg[i] + msg[i + 1], 16));
      }
    } else {
      for (i = 0; i < msg.length; i++)
        res[i] = msg[i] | 0;
    }
    return res;
  }
  var toArray_1 = toArray;

  function toHex$1(msg) {
    var res = '';
    for (var i = 0; i < msg.length; i++)
      res += zero2(msg[i].toString(16));
    return res;
  }
  var toHex_1 = toHex$1;

  function htonl(w) {
    var res = (w >>> 24) |
              ((w >>> 8) & 0xff00) |
              ((w << 8) & 0xff0000) |
              ((w & 0xff) << 24);
    return res >>> 0;
  }
  var htonl_1 = htonl;

  function toHex32(msg, endian) {
    var res = '';
    for (var i = 0; i < msg.length; i++) {
      var w = msg[i];
      if (endian === 'little')
        w = htonl(w);
      res += zero8(w.toString(16));
    }
    return res;
  }
  var toHex32_1 = toHex32;

  function zero2(word) {
    if (word.length === 1)
      return '0' + word;
    else
      return word;
  }
  var zero2_1 = zero2;

  function zero8(word) {
    if (word.length === 7)
      return '0' + word;
    else if (word.length === 6)
      return '00' + word;
    else if (word.length === 5)
      return '000' + word;
    else if (word.length === 4)
      return '0000' + word;
    else if (word.length === 3)
      return '00000' + word;
    else if (word.length === 2)
      return '000000' + word;
    else if (word.length === 1)
      return '0000000' + word;
    else
      return word;
  }
  var zero8_1 = zero8;

  function join32(msg, start, end, endian) {
    var len = end - start;
    minimalisticAssert(len % 4 === 0);
    var res = new Array(len / 4);
    for (var i = 0, k = start; i < res.length; i++, k += 4) {
      var w;
      if (endian === 'big')
        w = (msg[k] << 24) | (msg[k + 1] << 16) | (msg[k + 2] << 8) | msg[k + 3];
      else
        w = (msg[k + 3] << 24) | (msg[k + 2] << 16) | (msg[k + 1] << 8) | msg[k];
      res[i] = w >>> 0;
    }
    return res;
  }
  var join32_1 = join32;

  function split32(msg, endian) {
    var res = new Array(msg.length * 4);
    for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
      var m = msg[i];
      if (endian === 'big') {
        res[k] = m >>> 24;
        res[k + 1] = (m >>> 16) & 0xff;
        res[k + 2] = (m >>> 8) & 0xff;
        res[k + 3] = m & 0xff;
      } else {
        res[k + 3] = m >>> 24;
        res[k + 2] = (m >>> 16) & 0xff;
        res[k + 1] = (m >>> 8) & 0xff;
        res[k] = m & 0xff;
      }
    }
    return res;
  }
  var split32_1 = split32;

  function rotr32(w, b) {
    return (w >>> b) | (w << (32 - b));
  }
  var rotr32_1 = rotr32;

  function rotl32(w, b) {
    return (w << b) | (w >>> (32 - b));
  }
  var rotl32_1 = rotl32;

  function sum32(a, b) {
    return (a + b) >>> 0;
  }
  var sum32_1 = sum32;

  function sum32_3(a, b, c) {
    return (a + b + c) >>> 0;
  }
  var sum32_3_1 = sum32_3;

  function sum32_4(a, b, c, d) {
    return (a + b + c + d) >>> 0;
  }
  var sum32_4_1 = sum32_4;

  function sum32_5(a, b, c, d, e) {
    return (a + b + c + d + e) >>> 0;
  }
  var sum32_5_1 = sum32_5;

  function sum64(buf, pos, ah, al) {
    var bh = buf[pos];
    var bl = buf[pos + 1];

    var lo = (al + bl) >>> 0;
    var hi = (lo < al ? 1 : 0) + ah + bh;
    buf[pos] = hi >>> 0;
    buf[pos + 1] = lo;
  }
  var sum64_1 = sum64;

  function sum64_hi(ah, al, bh, bl) {
    var lo = (al + bl) >>> 0;
    var hi = (lo < al ? 1 : 0) + ah + bh;
    return hi >>> 0;
  }
  var sum64_hi_1 = sum64_hi;

  function sum64_lo(ah, al, bh, bl) {
    var lo = al + bl;
    return lo >>> 0;
  }
  var sum64_lo_1 = sum64_lo;

  function sum64_4_hi(ah, al, bh, bl, ch, cl, dh, dl) {
    var carry = 0;
    var lo = al;
    lo = (lo + bl) >>> 0;
    carry += lo < al ? 1 : 0;
    lo = (lo + cl) >>> 0;
    carry += lo < cl ? 1 : 0;
    lo = (lo + dl) >>> 0;
    carry += lo < dl ? 1 : 0;

    var hi = ah + bh + ch + dh + carry;
    return hi >>> 0;
  }
  var sum64_4_hi_1 = sum64_4_hi;

  function sum64_4_lo(ah, al, bh, bl, ch, cl, dh, dl) {
    var lo = al + bl + cl + dl;
    return lo >>> 0;
  }
  var sum64_4_lo_1 = sum64_4_lo;

  function sum64_5_hi(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
    var carry = 0;
    var lo = al;
    lo = (lo + bl) >>> 0;
    carry += lo < al ? 1 : 0;
    lo = (lo + cl) >>> 0;
    carry += lo < cl ? 1 : 0;
    lo = (lo + dl) >>> 0;
    carry += lo < dl ? 1 : 0;
    lo = (lo + el) >>> 0;
    carry += lo < el ? 1 : 0;

    var hi = ah + bh + ch + dh + eh + carry;
    return hi >>> 0;
  }
  var sum64_5_hi_1 = sum64_5_hi;

  function sum64_5_lo(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
    var lo = al + bl + cl + dl + el;

    return lo >>> 0;
  }
  var sum64_5_lo_1 = sum64_5_lo;

  function rotr64_hi(ah, al, num) {
    var r = (al << (32 - num)) | (ah >>> num);
    return r >>> 0;
  }
  var rotr64_hi_1 = rotr64_hi;

  function rotr64_lo(ah, al, num) {
    var r = (ah << (32 - num)) | (al >>> num);
    return r >>> 0;
  }
  var rotr64_lo_1 = rotr64_lo;

  function shr64_hi(ah, al, num) {
    return ah >>> num;
  }
  var shr64_hi_1 = shr64_hi;

  function shr64_lo(ah, al, num) {
    var r = (ah << (32 - num)) | (al >>> num);
    return r >>> 0;
  }
  var shr64_lo_1 = shr64_lo;

  var utils = {
  	inherits: inherits_1,
  	toArray: toArray_1,
  	toHex: toHex_1,
  	htonl: htonl_1,
  	toHex32: toHex32_1,
  	zero2: zero2_1,
  	zero8: zero8_1,
  	join32: join32_1,
  	split32: split32_1,
  	rotr32: rotr32_1,
  	rotl32: rotl32_1,
  	sum32: sum32_1,
  	sum32_3: sum32_3_1,
  	sum32_4: sum32_4_1,
  	sum32_5: sum32_5_1,
  	sum64: sum64_1,
  	sum64_hi: sum64_hi_1,
  	sum64_lo: sum64_lo_1,
  	sum64_4_hi: sum64_4_hi_1,
  	sum64_4_lo: sum64_4_lo_1,
  	sum64_5_hi: sum64_5_hi_1,
  	sum64_5_lo: sum64_5_lo_1,
  	rotr64_hi: rotr64_hi_1,
  	rotr64_lo: rotr64_lo_1,
  	shr64_hi: shr64_hi_1,
  	shr64_lo: shr64_lo_1
  };

  function BlockHash() {
    this.pending = null;
    this.pendingTotal = 0;
    this.blockSize = this.constructor.blockSize;
    this.outSize = this.constructor.outSize;
    this.hmacStrength = this.constructor.hmacStrength;
    this.padLength = this.constructor.padLength / 8;
    this.endian = 'big';

    this._delta8 = this.blockSize / 8;
    this._delta32 = this.blockSize / 32;
  }
  var BlockHash_1 = BlockHash;

  BlockHash.prototype.update = function update(msg, enc) {
    // Convert message to array, pad it, and join into 32bit blocks
    msg = utils.toArray(msg, enc);
    if (!this.pending)
      this.pending = msg;
    else
      this.pending = this.pending.concat(msg);
    this.pendingTotal += msg.length;

    // Enough data, try updating
    if (this.pending.length >= this._delta8) {
      msg = this.pending;

      // Process pending data in blocks
      var r = msg.length % this._delta8;
      this.pending = msg.slice(msg.length - r, msg.length);
      if (this.pending.length === 0)
        this.pending = null;

      msg = utils.join32(msg, 0, msg.length - r, this.endian);
      for (var i = 0; i < msg.length; i += this._delta32)
        this._update(msg, i, i + this._delta32);
    }

    return this;
  };

  BlockHash.prototype.digest = function digest(enc) {
    this.update(this._pad());
    minimalisticAssert(this.pending === null);

    return this._digest(enc);
  };

  BlockHash.prototype._pad = function pad() {
    var len = this.pendingTotal;
    var bytes = this._delta8;
    var k = bytes - ((len + this.padLength) % bytes);
    var res = new Array(k + this.padLength);
    res[0] = 0x80;
    for (var i = 1; i < k; i++)
      res[i] = 0;

    // Append length
    len <<= 3;
    if (this.endian === 'big') {
      for (var t = 8; t < this.padLength; t++)
        res[i++] = 0;

      res[i++] = 0;
      res[i++] = 0;
      res[i++] = 0;
      res[i++] = 0;
      res[i++] = (len >>> 24) & 0xff;
      res[i++] = (len >>> 16) & 0xff;
      res[i++] = (len >>> 8) & 0xff;
      res[i++] = len & 0xff;
    } else {
      res[i++] = len & 0xff;
      res[i++] = (len >>> 8) & 0xff;
      res[i++] = (len >>> 16) & 0xff;
      res[i++] = (len >>> 24) & 0xff;
      res[i++] = 0;
      res[i++] = 0;
      res[i++] = 0;
      res[i++] = 0;

      for (t = 8; t < this.padLength; t++)
        res[i++] = 0;
    }

    return res;
  };

  var common = {
  	BlockHash: BlockHash_1
  };

  var rotr32$1 = utils.rotr32;

  function ft_1(s, x, y, z) {
    if (s === 0)
      return ch32(x, y, z);
    if (s === 1 || s === 3)
      return p32(x, y, z);
    if (s === 2)
      return maj32(x, y, z);
  }
  var ft_1_1 = ft_1;

  function ch32(x, y, z) {
    return (x & y) ^ ((~x) & z);
  }
  var ch32_1 = ch32;

  function maj32(x, y, z) {
    return (x & y) ^ (x & z) ^ (y & z);
  }
  var maj32_1 = maj32;

  function p32(x, y, z) {
    return x ^ y ^ z;
  }
  var p32_1 = p32;

  function s0_256(x) {
    return rotr32$1(x, 2) ^ rotr32$1(x, 13) ^ rotr32$1(x, 22);
  }
  var s0_256_1 = s0_256;

  function s1_256(x) {
    return rotr32$1(x, 6) ^ rotr32$1(x, 11) ^ rotr32$1(x, 25);
  }
  var s1_256_1 = s1_256;

  function g0_256(x) {
    return rotr32$1(x, 7) ^ rotr32$1(x, 18) ^ (x >>> 3);
  }
  var g0_256_1 = g0_256;

  function g1_256(x) {
    return rotr32$1(x, 17) ^ rotr32$1(x, 19) ^ (x >>> 10);
  }
  var g1_256_1 = g1_256;

  var common$1 = {
  	ft_1: ft_1_1,
  	ch32: ch32_1,
  	maj32: maj32_1,
  	p32: p32_1,
  	s0_256: s0_256_1,
  	s1_256: s1_256_1,
  	g0_256: g0_256_1,
  	g1_256: g1_256_1
  };

  var sum32$1 = utils.sum32;
  var sum32_4$1 = utils.sum32_4;
  var sum32_5$1 = utils.sum32_5;
  var ch32$1 = common$1.ch32;
  var maj32$1 = common$1.maj32;
  var s0_256$1 = common$1.s0_256;
  var s1_256$1 = common$1.s1_256;
  var g0_256$1 = common$1.g0_256;
  var g1_256$1 = common$1.g1_256;

  var BlockHash$1 = common.BlockHash;

  var sha256_K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
    0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
    0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
    0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
    0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
    0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
    0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
    0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
    0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  function SHA256() {
    if (!(this instanceof SHA256))
      return new SHA256();

    BlockHash$1.call(this);
    this.h = [
      0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
      0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
    ];
    this.k = sha256_K;
    this.W = new Array(64);
  }
  utils.inherits(SHA256, BlockHash$1);
  var _256 = SHA256;

  SHA256.blockSize = 512;
  SHA256.outSize = 256;
  SHA256.hmacStrength = 192;
  SHA256.padLength = 64;

  SHA256.prototype._update = function _update(msg, start) {
    var W = this.W;

    for (var i = 0; i < 16; i++)
      W[i] = msg[start + i];
    for (; i < W.length; i++)
      W[i] = sum32_4$1(g1_256$1(W[i - 2]), W[i - 7], g0_256$1(W[i - 15]), W[i - 16]);

    var a = this.h[0];
    var b = this.h[1];
    var c = this.h[2];
    var d = this.h[3];
    var e = this.h[4];
    var f = this.h[5];
    var g = this.h[6];
    var h = this.h[7];

    minimalisticAssert(this.k.length === W.length);
    for (i = 0; i < W.length; i++) {
      var T1 = sum32_5$1(h, s1_256$1(e), ch32$1(e, f, g), this.k[i], W[i]);
      var T2 = sum32$1(s0_256$1(a), maj32$1(a, b, c));
      h = g;
      g = f;
      f = e;
      e = sum32$1(d, T1);
      d = c;
      c = b;
      b = a;
      a = sum32$1(T1, T2);
    }

    this.h[0] = sum32$1(this.h[0], a);
    this.h[1] = sum32$1(this.h[1], b);
    this.h[2] = sum32$1(this.h[2], c);
    this.h[3] = sum32$1(this.h[3], d);
    this.h[4] = sum32$1(this.h[4], e);
    this.h[5] = sum32$1(this.h[5], f);
    this.h[6] = sum32$1(this.h[6], g);
    this.h[7] = sum32$1(this.h[7], h);
  };

  SHA256.prototype._digest = function digest(enc) {
    if (enc === 'hex')
      return utils.toHex32(this.h, 'big');
    else
      return utils.split32(this.h, 'big');
  };

  var commonjsGlobal$2 = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global$1 !== 'undefined' ? global$1 : typeof self !== 'undefined' ? self : {};

  function createCommonjsModule$2(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  var _global$1 = createCommonjsModule$2(function (module) {
  // https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
  var global = module.exports = typeof window != 'undefined' && window.Math == Math
    ? window : typeof self != 'undefined' && self.Math == Math ? self
    // eslint-disable-next-line no-new-func
    : Function('return this')();
  if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
  });

  var _core$1 = createCommonjsModule$2(function (module) {
  var core = module.exports = { version: '2.6.9' };
  if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
  });
  var _core_1$1 = _core$1.version;

  var _aFunction$1 = function (it) {
    if (typeof it != 'function') throw TypeError(it + ' is not a function!');
    return it;
  };

  // optional / simple context binding

  var _ctx$1 = function (fn, that, length) {
    _aFunction$1(fn);
    if (that === undefined) return fn;
    switch (length) {
      case 1: return function (a) {
        return fn.call(that, a);
      };
      case 2: return function (a, b) {
        return fn.call(that, a, b);
      };
      case 3: return function (a, b, c) {
        return fn.call(that, a, b, c);
      };
    }
    return function (/* ...args */) {
      return fn.apply(that, arguments);
    };
  };

  var _isObject$1 = function (it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };

  var _anObject$1 = function (it) {
    if (!_isObject$1(it)) throw TypeError(it + ' is not an object!');
    return it;
  };

  var _fails$1 = function (exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };

  // Thank's IE8 for his funny defineProperty
  var _descriptors$1 = !_fails$1(function () {
    return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
  });

  var document$3 = _global$1.document;
  // typeof document.createElement is 'object' in old IE
  var is$1 = _isObject$1(document$3) && _isObject$1(document$3.createElement);
  var _domCreate$1 = function (it) {
    return is$1 ? document$3.createElement(it) : {};
  };

  var _ie8DomDefine$1 = !_descriptors$1 && !_fails$1(function () {
    return Object.defineProperty(_domCreate$1('div'), 'a', { get: function () { return 7; } }).a != 7;
  });

  // 7.1.1 ToPrimitive(input [, PreferredType])

  // instead of the ES6 spec version, we didn't implement @@toPrimitive case
  // and the second argument - flag - preferred type is a string
  var _toPrimitive$1 = function (it, S) {
    if (!_isObject$1(it)) return it;
    var fn, val;
    if (S && typeof (fn = it.toString) == 'function' && !_isObject$1(val = fn.call(it))) return val;
    if (typeof (fn = it.valueOf) == 'function' && !_isObject$1(val = fn.call(it))) return val;
    if (!S && typeof (fn = it.toString) == 'function' && !_isObject$1(val = fn.call(it))) return val;
    throw TypeError("Can't convert object to primitive value");
  };

  var dP$2 = Object.defineProperty;

  var f$7 = _descriptors$1 ? Object.defineProperty : function defineProperty(O, P, Attributes) {
    _anObject$1(O);
    P = _toPrimitive$1(P, true);
    _anObject$1(Attributes);
    if (_ie8DomDefine$1) try {
      return dP$2(O, P, Attributes);
    } catch (e) { /* empty */ }
    if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
    if ('value' in Attributes) O[P] = Attributes.value;
    return O;
  };

  var _objectDp$1 = {
  	f: f$7
  };

  var _propertyDesc$1 = function (bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };

  var _hide$1 = _descriptors$1 ? function (object, key, value) {
    return _objectDp$1.f(object, key, _propertyDesc$1(1, value));
  } : function (object, key, value) {
    object[key] = value;
    return object;
  };

  var hasOwnProperty$d = {}.hasOwnProperty;
  var _has$1 = function (it, key) {
    return hasOwnProperty$d.call(it, key);
  };

  var PROTOTYPE$3 = 'prototype';

  var $export$1 = function (type, name, source) {
    var IS_FORCED = type & $export$1.F;
    var IS_GLOBAL = type & $export$1.G;
    var IS_STATIC = type & $export$1.S;
    var IS_PROTO = type & $export$1.P;
    var IS_BIND = type & $export$1.B;
    var IS_WRAP = type & $export$1.W;
    var exports = IS_GLOBAL ? _core$1 : _core$1[name] || (_core$1[name] = {});
    var expProto = exports[PROTOTYPE$3];
    var target = IS_GLOBAL ? _global$1 : IS_STATIC ? _global$1[name] : (_global$1[name] || {})[PROTOTYPE$3];
    var key, own, out;
    if (IS_GLOBAL) source = name;
    for (key in source) {
      // contains in native
      own = !IS_FORCED && target && target[key] !== undefined;
      if (own && _has$1(exports, key)) continue;
      // export native or passed
      out = own ? target[key] : source[key];
      // prevent global pollution for namespaces
      exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
      // bind timers to global for call from export context
      : IS_BIND && own ? _ctx$1(out, _global$1)
      // wrap global constructors for prevent change them in library
      : IS_WRAP && target[key] == out ? (function (C) {
        var F = function (a, b, c) {
          if (this instanceof C) {
            switch (arguments.length) {
              case 0: return new C();
              case 1: return new C(a);
              case 2: return new C(a, b);
            } return new C(a, b, c);
          } return C.apply(this, arguments);
        };
        F[PROTOTYPE$3] = C[PROTOTYPE$3];
        return F;
      // make static versions for prototype methods
      })(out) : IS_PROTO && typeof out == 'function' ? _ctx$1(Function.call, out) : out;
      // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
      if (IS_PROTO) {
        (exports.virtual || (exports.virtual = {}))[key] = out;
        // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
        if (type & $export$1.R && expProto && !expProto[key]) _hide$1(expProto, key, out);
      }
    }
  };
  // type bitmap
  $export$1.F = 1;   // forced
  $export$1.G = 2;   // global
  $export$1.S = 4;   // static
  $export$1.P = 8;   // proto
  $export$1.B = 16;  // bind
  $export$1.W = 32;  // wrap
  $export$1.U = 64;  // safe
  $export$1.R = 128; // real proto method for `library`
  var _export$1 = $export$1;

  var toString$3 = {}.toString;

  var _cof$1 = function (it) {
    return toString$3.call(it).slice(8, -1);
  };

  // fallback for non-array-like ES3 and non-enumerable old V8 strings

  // eslint-disable-next-line no-prototype-builtins
  var _iobject$1 = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
    return _cof$1(it) == 'String' ? it.split('') : Object(it);
  };

  // 7.2.1 RequireObjectCoercible(argument)
  var _defined$1 = function (it) {
    if (it == undefined) throw TypeError("Can't call method on  " + it);
    return it;
  };

  // to indexed object, toObject with fallback for non-array-like ES3 strings


  var _toIobject$1 = function (it) {
    return _iobject$1(_defined$1(it));
  };

  // 7.1.4 ToInteger
  var ceil$1 = Math.ceil;
  var floor$1 = Math.floor;
  var _toInteger$1 = function (it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor$1 : ceil$1)(it);
  };

  // 7.1.15 ToLength

  var min$2 = Math.min;
  var _toLength$1 = function (it) {
    return it > 0 ? min$2(_toInteger$1(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
  };

  var max$1 = Math.max;
  var min$1$1 = Math.min;
  var _toAbsoluteIndex$1 = function (index, length) {
    index = _toInteger$1(index);
    return index < 0 ? max$1(index + length, 0) : min$1$1(index, length);
  };

  // false -> Array#indexOf
  // true  -> Array#includes



  var _arrayIncludes$1 = function (IS_INCLUDES) {
    return function ($this, el, fromIndex) {
      var O = _toIobject$1($this);
      var length = _toLength$1(O.length);
      var index = _toAbsoluteIndex$1(fromIndex, length);
      var value;
      // Array#includes uses SameValueZero equality algorithm
      // eslint-disable-next-line no-self-compare
      if (IS_INCLUDES && el != el) while (length > index) {
        value = O[index++];
        // eslint-disable-next-line no-self-compare
        if (value != value) return true;
      // Array#indexOf ignores holes, Array#includes - not
      } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
        if (O[index] === el) return IS_INCLUDES || index || 0;
      } return !IS_INCLUDES && -1;
    };
  };

  var _shared$1 = createCommonjsModule$2(function (module) {
  var SHARED = '__core-js_shared__';
  var store = _global$1[SHARED] || (_global$1[SHARED] = {});

  (module.exports = function (key, value) {
    return store[key] || (store[key] = value !== undefined ? value : {});
  })('versions', []).push({
    version: _core$1.version,
    mode:  'pure' ,
    copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
  });
  });

  var id$1 = 0;
  var px$1 = Math.random();
  var _uid$1 = function (key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id$1 + px$1).toString(36));
  };

  var shared$1 = _shared$1('keys');

  var _sharedKey$1 = function (key) {
    return shared$1[key] || (shared$1[key] = _uid$1(key));
  };

  var arrayIndexOf$2 = _arrayIncludes$1(false);
  var IE_PROTO$3 = _sharedKey$1('IE_PROTO');

  var _objectKeysInternal$1 = function (object, names) {
    var O = _toIobject$1(object);
    var i = 0;
    var result = [];
    var key;
    for (key in O) if (key != IE_PROTO$3) _has$1(O, key) && result.push(key);
    // Don't enum bug & hidden keys
    while (names.length > i) if (_has$1(O, key = names[i++])) {
      ~arrayIndexOf$2(result, key) || result.push(key);
    }
    return result;
  };

  // IE 8- don't enum bug keys
  var _enumBugKeys$1 = (
    'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
  ).split(',');

  // 19.1.2.14 / 15.2.3.14 Object.keys(O)



  var _objectKeys$1 = Object.keys || function keys(O) {
    return _objectKeysInternal$1(O, _enumBugKeys$1);
  };

  var f$1$1 = {}.propertyIsEnumerable;

  var _objectPie$1 = {
  	f: f$1$1
  };

  var isEnum$1 = _objectPie$1.f;
  var _objectToArray = function (isEntries) {
    return function (it) {
      var O = _toIobject$1(it);
      var keys = _objectKeys$1(O);
      var length = keys.length;
      var i = 0;
      var result = [];
      var key;
      while (length > i) {
        key = keys[i++];
        if (!_descriptors$1 || isEnum$1.call(O, key)) {
          result.push(isEntries ? [key, O[key]] : O[key]);
        }
      }
      return result;
    };
  };

  // https://github.com/tc39/proposal-object-values-entries

  var $entries = _objectToArray(true);

  _export$1(_export$1.S, 'Object', {
    entries: function entries(it) {
      return $entries(it);
    }
  });

  var entries = _core$1.Object.entries;

  var entries$1 = entries;

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject$3(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  var isObject_1$1 = isObject$3;

  /** Used for built-in method references. */
  var objectProto$d = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype$1(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto$d;

    return value === proto;
  }

  var _isPrototype$1 = isPrototype$1;

  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg$1(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }

  var _overArg$1 = overArg$1;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeKeys$1 = _overArg$1(Object.keys, Object);

  var _nativeKeys$1 = nativeKeys$1;

  /** Used for built-in method references. */
  var objectProto$1$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$1$1 = objectProto$1$1.hasOwnProperty;

  /**
   * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
   *
   * @private
   * @param {Object} object The object to query.
   * @returns {Array} Returns the array of property names.
   */
  function baseKeys$1(object) {
    if (!_isPrototype$1(object)) {
      return _nativeKeys$1(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty$1$1.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }

  var _baseKeys$1 = baseKeys$1;

  /** Detect free variable `global` from Node.js. */
  var freeGlobal$1 = typeof commonjsGlobal$2 == 'object' && commonjsGlobal$2 && commonjsGlobal$2.Object === Object && commonjsGlobal$2;

  var _freeGlobal$1 = freeGlobal$1;

  /** Detect free variable `self`. */
  var freeSelf$1 = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root$1 = _freeGlobal$1 || freeSelf$1 || Function('return this')();

  var _root$1 = root$1;

  /** Built-in value references. */
  var Symbol$2 = _root$1.Symbol;

  var _Symbol$1 = Symbol$2;

  /** Used for built-in method references. */
  var objectProto$2$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$2$1 = objectProto$2$1.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$2 = objectProto$2$1.toString;

  /** Built-in value references. */
  var symToStringTag$2 = _Symbol$1 ? _Symbol$1.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag$1(value) {
    var isOwn = hasOwnProperty$2$1.call(value, symToStringTag$2),
        tag = value[symToStringTag$2];

    try {
      value[symToStringTag$2] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString$2.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$2] = tag;
      } else {
        delete value[symToStringTag$2];
      }
    }
    return result;
  }

  var _getRawTag$1 = getRawTag$1;

  /** Used for built-in method references. */
  var objectProto$3$1 = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1$1 = objectProto$3$1.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString$2(value) {
    return nativeObjectToString$1$1.call(value);
  }

  var _objectToString$1 = objectToString$2;

  /** `Object#toString` result references. */
  var nullTag$1 = '[object Null]',
      undefinedTag$1 = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag$1$1 = _Symbol$1 ? _Symbol$1.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag$1(value) {
    if (value == null) {
      return value === undefined ? undefinedTag$1 : nullTag$1;
    }
    return (symToStringTag$1$1 && symToStringTag$1$1 in Object(value))
      ? _getRawTag$1(value)
      : _objectToString$1(value);
  }

  var _baseGetTag$1 = baseGetTag$1;

  /** `Object#toString` result references. */
  var asyncTag$1 = '[object AsyncFunction]',
      funcTag$2 = '[object Function]',
      genTag$1 = '[object GeneratorFunction]',
      proxyTag$1 = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction$2(value) {
    if (!isObject_1$1(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = _baseGetTag$1(value);
    return tag == funcTag$2 || tag == genTag$1 || tag == asyncTag$1 || tag == proxyTag$1;
  }

  var isFunction_1$1 = isFunction$2;

  /** Used to detect overreaching core-js shims. */
  var coreJsData$1 = _root$1['__core-js_shared__'];

  var _coreJsData$1 = coreJsData$1;

  /** Used to detect methods masquerading as native. */
  var maskSrcKey$1 = (function() {
    var uid = /[^.]+$/.exec(_coreJsData$1 && _coreJsData$1.keys && _coreJsData$1.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());

  /**
   * Checks if `func` has its source masked.
   *
   * @private
   * @param {Function} func The function to check.
   * @returns {boolean} Returns `true` if `func` is masked, else `false`.
   */
  function isMasked$1(func) {
    return !!maskSrcKey$1 && (maskSrcKey$1 in func);
  }

  var _isMasked$1 = isMasked$1;

  /** Used for built-in method references. */
  var funcProto$3 = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$3 = funcProto$3.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource$1(func) {
    if (func != null) {
      try {
        return funcToString$3.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }

  var _toSource$1 = toSource$1;

  /**
   * Used to match `RegExp`
   * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
   */
  var reRegExpChar$1 = /[\\^$.*+?()[\]{}|]/g;

  /** Used to detect host constructors (Safari). */
  var reIsHostCtor$1 = /^\[object .+?Constructor\]$/;

  /** Used for built-in method references. */
  var funcProto$1$1 = Function.prototype,
      objectProto$4$1 = Object.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString$1$1 = funcProto$1$1.toString;

  /** Used to check objects for own properties. */
  var hasOwnProperty$3$1 = objectProto$4$1.hasOwnProperty;

  /** Used to detect if a method is native. */
  var reIsNative$1 = RegExp('^' +
    funcToString$1$1.call(hasOwnProperty$3$1).replace(reRegExpChar$1, '\\$&')
    .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
  );

  /**
   * The base implementation of `_.isNative` without bad shim checks.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a native function,
   *  else `false`.
   */
  function baseIsNative$1(value) {
    if (!isObject_1$1(value) || _isMasked$1(value)) {
      return false;
    }
    var pattern = isFunction_1$1(value) ? reIsNative$1 : reIsHostCtor$1;
    return pattern.test(_toSource$1(value));
  }

  var _baseIsNative$1 = baseIsNative$1;

  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue$1(object, key) {
    return object == null ? undefined : object[key];
  }

  var _getValue$1 = getValue$1;

  /**
   * Gets the native function at `key` of `object`.
   *
   * @private
   * @param {Object} object The object to query.
   * @param {string} key The key of the method to get.
   * @returns {*} Returns the function if it's native, else `undefined`.
   */
  function getNative$1(object, key) {
    var value = _getValue$1(object, key);
    return _baseIsNative$1(value) ? value : undefined;
  }

  var _getNative$1 = getNative$1;

  /* Built-in method references that are verified to be native. */
  var DataView = _getNative$1(_root$1, 'DataView');

  var _DataView = DataView;

  /* Built-in method references that are verified to be native. */
  var Map$2 = _getNative$1(_root$1, 'Map');

  var _Map$1 = Map$2;

  /* Built-in method references that are verified to be native. */
  var Promise$1 = _getNative$1(_root$1, 'Promise');

  var _Promise = Promise$1;

  /* Built-in method references that are verified to be native. */
  var Set = _getNative$1(_root$1, 'Set');

  var _Set = Set;

  /* Built-in method references that are verified to be native. */
  var WeakMap = _getNative$1(_root$1, 'WeakMap');

  var _WeakMap = WeakMap;

  /** `Object#toString` result references. */
  var mapTag$1 = '[object Map]',
      objectTag$2 = '[object Object]',
      promiseTag = '[object Promise]',
      setTag$1 = '[object Set]',
      weakMapTag$1 = '[object WeakMap]';

  var dataViewTag$1 = '[object DataView]';

  /** Used to detect maps, sets, and weakmaps. */
  var dataViewCtorString = _toSource$1(_DataView),
      mapCtorString = _toSource$1(_Map$1),
      promiseCtorString = _toSource$1(_Promise),
      setCtorString = _toSource$1(_Set),
      weakMapCtorString = _toSource$1(_WeakMap);

  /**
   * Gets the `toStringTag` of `value`.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  var getTag = _baseGetTag$1;

  // Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
  if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != dataViewTag$1) ||
      (_Map$1 && getTag(new _Map$1) != mapTag$1) ||
      (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
      (_Set && getTag(new _Set) != setTag$1) ||
      (_WeakMap && getTag(new _WeakMap) != weakMapTag$1)) {
    getTag = function(value) {
      var result = _baseGetTag$1(value),
          Ctor = result == objectTag$2 ? value.constructor : undefined,
          ctorString = Ctor ? _toSource$1(Ctor) : '';

      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString: return dataViewTag$1;
          case mapCtorString: return mapTag$1;
          case promiseCtorString: return promiseTag;
          case setCtorString: return setTag$1;
          case weakMapCtorString: return weakMapTag$1;
        }
      }
      return result;
    };
  }

  var _getTag = getTag;

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike$1(value) {
    return value != null && typeof value == 'object';
  }

  var isObjectLike_1$1 = isObjectLike$1;

  /** `Object#toString` result references. */
  var argsTag$2 = '[object Arguments]';

  /**
   * The base implementation of `_.isArguments`.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   */
  function baseIsArguments$1(value) {
    return isObjectLike_1$1(value) && _baseGetTag$1(value) == argsTag$2;
  }

  var _baseIsArguments$1 = baseIsArguments$1;

  /** Used for built-in method references. */
  var objectProto$5$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$4$1 = objectProto$5$1.hasOwnProperty;

  /** Built-in value references. */
  var propertyIsEnumerable$1 = objectProto$5$1.propertyIsEnumerable;

  /**
   * Checks if `value` is likely an `arguments` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an `arguments` object,
   *  else `false`.
   * @example
   *
   * _.isArguments(function() { return arguments; }());
   * // => true
   *
   * _.isArguments([1, 2, 3]);
   * // => false
   */
  var isArguments$1 = _baseIsArguments$1(function() { return arguments; }()) ? _baseIsArguments$1 : function(value) {
    return isObjectLike_1$1(value) && hasOwnProperty$4$1.call(value, 'callee') &&
      !propertyIsEnumerable$1.call(value, 'callee');
  };

  var isArguments_1$1 = isArguments$1;

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray$5 = Array.isArray;

  var isArray_1$1 = isArray$5;

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$2 = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength$1(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER$2;
  }

  var isLength_1$1 = isLength$1;

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike$1(value) {
    return value != null && isLength_1$1(value.length) && !isFunction_1$1(value);
  }

  var isArrayLike_1$1 = isArrayLike$1;

  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse$1() {
    return false;
  }

  var stubFalse_1$1 = stubFalse$1;

  var isBuffer_1$1 = createCommonjsModule$2(function (module, exports) {
  /** Detect free variable `exports`. */
  var freeExports =  exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Built-in value references. */
  var Buffer = moduleExports ? _root$1.Buffer : undefined;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;

  /**
   * Checks if `value` is a buffer.
   *
   * @static
   * @memberOf _
   * @since 4.3.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
   * @example
   *
   * _.isBuffer(new Buffer(2));
   * // => true
   *
   * _.isBuffer(new Uint8Array(2));
   * // => false
   */
  var isBuffer = nativeIsBuffer || stubFalse_1$1;

  module.exports = isBuffer;
  });

  /** `Object#toString` result references. */
  var argsTag$1$1 = '[object Arguments]',
      arrayTag$1 = '[object Array]',
      boolTag$1 = '[object Boolean]',
      dateTag$1 = '[object Date]',
      errorTag$1 = '[object Error]',
      funcTag$1$1 = '[object Function]',
      mapTag$1$1 = '[object Map]',
      numberTag$1 = '[object Number]',
      objectTag$1$1 = '[object Object]',
      regexpTag$1 = '[object RegExp]',
      setTag$1$1 = '[object Set]',
      stringTag$1 = '[object String]',
      weakMapTag$1$1 = '[object WeakMap]';

  var arrayBufferTag$1 = '[object ArrayBuffer]',
      dataViewTag$1$1 = '[object DataView]',
      float32Tag$1 = '[object Float32Array]',
      float64Tag$1 = '[object Float64Array]',
      int8Tag$1 = '[object Int8Array]',
      int16Tag$1 = '[object Int16Array]',
      int32Tag$1 = '[object Int32Array]',
      uint8Tag$1 = '[object Uint8Array]',
      uint8ClampedTag$1 = '[object Uint8ClampedArray]',
      uint16Tag$1 = '[object Uint16Array]',
      uint32Tag$1 = '[object Uint32Array]';

  /** Used to identify `toStringTag` values of typed arrays. */
  var typedArrayTags$1 = {};
  typedArrayTags$1[float32Tag$1] = typedArrayTags$1[float64Tag$1] =
  typedArrayTags$1[int8Tag$1] = typedArrayTags$1[int16Tag$1] =
  typedArrayTags$1[int32Tag$1] = typedArrayTags$1[uint8Tag$1] =
  typedArrayTags$1[uint8ClampedTag$1] = typedArrayTags$1[uint16Tag$1] =
  typedArrayTags$1[uint32Tag$1] = true;
  typedArrayTags$1[argsTag$1$1] = typedArrayTags$1[arrayTag$1] =
  typedArrayTags$1[arrayBufferTag$1] = typedArrayTags$1[boolTag$1] =
  typedArrayTags$1[dataViewTag$1$1] = typedArrayTags$1[dateTag$1] =
  typedArrayTags$1[errorTag$1] = typedArrayTags$1[funcTag$1$1] =
  typedArrayTags$1[mapTag$1$1] = typedArrayTags$1[numberTag$1] =
  typedArrayTags$1[objectTag$1$1] = typedArrayTags$1[regexpTag$1] =
  typedArrayTags$1[setTag$1$1] = typedArrayTags$1[stringTag$1] =
  typedArrayTags$1[weakMapTag$1$1] = false;

  /**
   * The base implementation of `_.isTypedArray` without Node.js optimizations.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   */
  function baseIsTypedArray$1(value) {
    return isObjectLike_1$1(value) &&
      isLength_1$1(value.length) && !!typedArrayTags$1[_baseGetTag$1(value)];
  }

  var _baseIsTypedArray$1 = baseIsTypedArray$1;

  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary$1(func) {
    return function(value) {
      return func(value);
    };
  }

  var _baseUnary$1 = baseUnary$1;

  var _nodeUtil$1 = createCommonjsModule$2(function (module, exports) {
  /** Detect free variable `exports`. */
  var freeExports =  exports && !exports.nodeType && exports;

  /** Detect free variable `module`. */
  var freeModule = freeExports && 'object' == 'object' && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports`. */
  var moduleExports = freeModule && freeModule.exports === freeExports;

  /** Detect free variable `process` from Node.js. */
  var freeProcess = moduleExports && _freeGlobal$1.process;

  /** Used to access faster Node.js helpers. */
  var nodeUtil = (function() {
    try {
      // Use `util.types` for Node.js 10+.
      var types = freeModule && freeModule.require && freeModule.require('util').types;

      if (types) {
        return types;
      }

      // Legacy `process.binding('util')` for Node.js < 10.
      return freeProcess && freeProcess.binding && freeProcess.binding('util');
    } catch (e) {}
  }());

  module.exports = nodeUtil;
  });

  /* Node.js helper references. */
  var nodeIsTypedArray$1 = _nodeUtil$1 && _nodeUtil$1.isTypedArray;

  /**
   * Checks if `value` is classified as a typed array.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
   * @example
   *
   * _.isTypedArray(new Uint8Array);
   * // => true
   *
   * _.isTypedArray([]);
   * // => false
   */
  var isTypedArray$1 = nodeIsTypedArray$1 ? _baseUnary$1(nodeIsTypedArray$1) : _baseIsTypedArray$1;

  var isTypedArray_1$1 = isTypedArray$1;

  /** `Object#toString` result references. */
  var mapTag$2 = '[object Map]',
      setTag$2 = '[object Set]';

  /** Used for built-in method references. */
  var objectProto$6$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty$5$1 = objectProto$6$1.hasOwnProperty;

  /**
   * Checks if `value` is an empty object, collection, map, or set.
   *
   * Objects are considered empty if they have no own enumerable string keyed
   * properties.
   *
   * Array-like values such as `arguments` objects, arrays, buffers, strings, or
   * jQuery-like collections are considered empty if they have a `length` of `0`.
   * Similarly, maps and sets are considered empty if they have a `size` of `0`.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is empty, else `false`.
   * @example
   *
   * _.isEmpty(null);
   * // => true
   *
   * _.isEmpty(true);
   * // => true
   *
   * _.isEmpty(1);
   * // => true
   *
   * _.isEmpty([1, 2, 3]);
   * // => false
   *
   * _.isEmpty({ 'a': 1 });
   * // => false
   */
  function isEmpty$1(value) {
    if (value == null) {
      return true;
    }
    if (isArrayLike_1$1(value) &&
        (isArray_1$1(value) || typeof value == 'string' || typeof value.splice == 'function' ||
          isBuffer_1$1(value) || isTypedArray_1$1(value) || isArguments_1$1(value))) {
      return !value.length;
    }
    var tag = _getTag(value);
    if (tag == mapTag$2 || tag == setTag$2) {
      return !value.size;
    }
    if (_isPrototype$1(value)) {
      return !_baseKeys$1(value).length;
    }
    for (var key in value) {
      if (hasOwnProperty$5$1.call(value, key)) {
        return false;
      }
    }
    return true;
  }

  var isEmpty_1 = isEmpty$1;

  function sort(){var params=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{};if(!isObject_1$1(params)||isEmpty_1(params))throw new Error("params is not Object or no value in sort function!");return entries$1(params).sort(function(pre,after){return "".concat(pre)>"".concat(after)?1:-1})}

  // 7.1.13 ToObject(argument)

  var _toObject$1 = function (it) {
    return Object(_defined$1(it));
  };

  // most Object methods by ES6 should accept primitives



  var _objectSap$1 = function (KEY, exec) {
    var fn = (_core$1.Object || {})[KEY] || Object[KEY];
    var exp = {};
    exp[KEY] = exec(fn);
    _export$1(_export$1.S + _export$1.F * _fails$1(function () { fn(1); }), 'Object', exp);
  };

  // 19.1.2.14 Object.keys(O)



  _objectSap$1('keys', function () {
    return function keys(it) {
      return _objectKeys$1(_toObject$1(it));
    };
  });

  var keys$3 = _core$1.Object.keys;

  var keys$1$1 = keys$3;

  function filterNull(){var params=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};if(!isObject_1$1(params)||isEmpty_1(params))throw new Error("params is not Object or no value in filterNull function!");var tmp={};return keys$1$1(params).forEach(function(key){var val=params[key];(0===val||val)&&(tmp[key]=val);}),tmp}

  // 7.2.2 IsArray(argument)

  var _isArray$1 = Array.isArray || function isArray(arg) {
    return _cof$1(arg) == 'Array';
  };

  // 22.1.2.2 / 15.4.3.2 Array.isArray(arg)


  _export$1(_export$1.S, 'Array', { isArray: _isArray$1 });

  var isArray$1$1 = _core$1.Array.isArray;

  var isArray$2$1 = isArray$1$1;

  function _arrayWithHoles(arr) {
    if (isArray$2$1(arr)) return arr;
  }

  var arrayWithHoles = _arrayWithHoles;

  var _iterStep$1 = function (done, value) {
    return { value: value, done: !!done };
  };

  var _iterators = {};

  var _redefine$1 = _hide$1;

  var _objectDps$1 = _descriptors$1 ? Object.defineProperties : function defineProperties(O, Properties) {
    _anObject$1(O);
    var keys = _objectKeys$1(Properties);
    var length = keys.length;
    var i = 0;
    var P;
    while (length > i) _objectDp$1.f(O, P = keys[i++], Properties[P]);
    return O;
  };

  var document$1$1 = _global$1.document;
  var _html$1 = document$1$1 && document$1$1.documentElement;

  // 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



  var IE_PROTO$1$1 = _sharedKey$1('IE_PROTO');
  var Empty$1 = function () { /* empty */ };
  var PROTOTYPE$1$1 = 'prototype';

  // Create object with fake `null` prototype: use iframe Object with cleared prototype
  var createDict$1 = function () {
    // Thrash, waste and sodomy: IE GC bug
    var iframe = _domCreate$1('iframe');
    var i = _enumBugKeys$1.length;
    var lt = '<';
    var gt = '>';
    var iframeDocument;
    iframe.style.display = 'none';
    _html$1.appendChild(iframe);
    iframe.src = 'javascript:'; // eslint-disable-line no-script-url
    // createDict = iframe.contentWindow.Object;
    // html.removeChild(iframe);
    iframeDocument = iframe.contentWindow.document;
    iframeDocument.open();
    iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
    iframeDocument.close();
    createDict$1 = iframeDocument.F;
    while (i--) delete createDict$1[PROTOTYPE$1$1][_enumBugKeys$1[i]];
    return createDict$1();
  };

  var _objectCreate$1 = Object.create || function create(O, Properties) {
    var result;
    if (O !== null) {
      Empty$1[PROTOTYPE$1$1] = _anObject$1(O);
      result = new Empty$1();
      Empty$1[PROTOTYPE$1$1] = null;
      // add "__proto__" for Object.getPrototypeOf polyfill
      result[IE_PROTO$1$1] = O;
    } else result = createDict$1();
    return Properties === undefined ? result : _objectDps$1(result, Properties);
  };

  var _wks$1 = createCommonjsModule$2(function (module) {
  var store = _shared$1('wks');

  var Symbol = _global$1.Symbol;
  var USE_SYMBOL = typeof Symbol == 'function';

  var $exports = module.exports = function (name) {
    return store[name] || (store[name] =
      USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid$1)('Symbol.' + name));
  };

  $exports.store = store;
  });

  var def$1 = _objectDp$1.f;

  var TAG$1 = _wks$1('toStringTag');

  var _setToStringTag$1 = function (it, tag, stat) {
    if (it && !_has$1(it = stat ? it : it.prototype, TAG$1)) def$1(it, TAG$1, { configurable: true, value: tag });
  };

  var IteratorPrototype$1 = {};

  // 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
  _hide$1(IteratorPrototype$1, _wks$1('iterator'), function () { return this; });

  var _iterCreate$1 = function (Constructor, NAME, next) {
    Constructor.prototype = _objectCreate$1(IteratorPrototype$1, { next: _propertyDesc$1(1, next) });
    _setToStringTag$1(Constructor, NAME + ' Iterator');
  };

  // 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


  var IE_PROTO$2$1 = _sharedKey$1('IE_PROTO');
  var ObjectProto$2 = Object.prototype;

  var _objectGpo$1 = Object.getPrototypeOf || function (O) {
    O = _toObject$1(O);
    if (_has$1(O, IE_PROTO$2$1)) return O[IE_PROTO$2$1];
    if (typeof O.constructor == 'function' && O instanceof O.constructor) {
      return O.constructor.prototype;
    } return O instanceof Object ? ObjectProto$2 : null;
  };

  var ITERATOR$1 = _wks$1('iterator');
  var BUGGY$1 = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
  var FF_ITERATOR$1 = '@@iterator';
  var KEYS$1 = 'keys';
  var VALUES$1 = 'values';

  var returnThis = function () { return this; };

  var _iterDefine$1 = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    _iterCreate$1(Constructor, NAME, next);
    var getMethod = function (kind) {
      if (!BUGGY$1 && kind in proto) return proto[kind];
      switch (kind) {
        case KEYS$1: return function keys() { return new Constructor(this, kind); };
        case VALUES$1: return function values() { return new Constructor(this, kind); };
      } return function entries() { return new Constructor(this, kind); };
    };
    var TAG = NAME + ' Iterator';
    var DEF_VALUES = DEFAULT == VALUES$1;
    var VALUES_BUG = false;
    var proto = Base.prototype;
    var $native = proto[ITERATOR$1] || proto[FF_ITERATOR$1] || DEFAULT && proto[DEFAULT];
    var $default = $native || getMethod(DEFAULT);
    var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
    var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
    var methods, key, IteratorPrototype;
    // Fix native
    if ($anyNative) {
      IteratorPrototype = _objectGpo$1($anyNative.call(new Base()));
      if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
        // Set @@toStringTag to native iterators
        _setToStringTag$1(IteratorPrototype, TAG, true);
      }
    }
    // fix Array#{values, @@iterator}.name in V8 / FF
    if (DEF_VALUES && $native && $native.name !== VALUES$1) {
      VALUES_BUG = true;
      $default = function values() { return $native.call(this); };
    }
    // Define iterator
    if (( FORCED) && (BUGGY$1 || VALUES_BUG || !proto[ITERATOR$1])) {
      _hide$1(proto, ITERATOR$1, $default);
    }
    // Plug for library
    _iterators[NAME] = $default;
    _iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES$1),
        keys: IS_SET ? $default : getMethod(KEYS$1),
        entries: $entries
      };
      if (FORCED) for (key in methods) {
        if (!(key in proto)) _redefine$1(proto, key, methods[key]);
      } else _export$1(_export$1.P + _export$1.F * (BUGGY$1 || VALUES_BUG), NAME, methods);
    }
    return methods;
  };

  // 22.1.3.4 Array.prototype.entries()
  // 22.1.3.13 Array.prototype.keys()
  // 22.1.3.29 Array.prototype.values()
  // 22.1.3.30 Array.prototype[@@iterator]()
  var es6_array_iterator$1 = _iterDefine$1(Array, 'Array', function (iterated, kind) {
    this._t = _toIobject$1(iterated); // target
    this._i = 0;                   // next index
    this._k = kind;                // kind
  // 22.1.5.2.1 %ArrayIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var kind = this._k;
    var index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return _iterStep$1(1);
    }
    if (kind == 'keys') return _iterStep$1(0, index);
    if (kind == 'values') return _iterStep$1(0, O[index]);
    return _iterStep$1(0, [index, O[index]]);
  }, 'values');

  // argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
  _iterators.Arguments = _iterators.Array;

  var TO_STRING_TAG$1 = _wks$1('toStringTag');

  var DOMIterables$1 = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
    'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
    'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
    'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
    'TextTrackList,TouchList').split(',');

  for (var i$2 = 0; i$2 < DOMIterables$1.length; i$2++) {
    var NAME$1 = DOMIterables$1[i$2];
    var Collection$1 = _global$1[NAME$1];
    var proto$1 = Collection$1 && Collection$1.prototype;
    if (proto$1 && !proto$1[TO_STRING_TAG$1]) _hide$1(proto$1, TO_STRING_TAG$1, NAME$1);
    _iterators[NAME$1] = _iterators.Array;
  }

  // true  -> String#at
  // false -> String#codePointAt
  var _stringAt$1 = function (TO_STRING) {
    return function (that, pos) {
      var s = String(_defined$1(that));
      var i = _toInteger$1(pos);
      var l = s.length;
      var a, b;
      if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
        ? TO_STRING ? s.charAt(i) : a
        : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };

  var $at$1 = _stringAt$1(true);

  // 21.1.3.27 String.prototype[@@iterator]()
  _iterDefine$1(String, 'String', function (iterated) {
    this._t = String(iterated); // target
    this._i = 0;                // next index
  // 21.1.5.2.1 %StringIteratorPrototype%.next()
  }, function () {
    var O = this._t;
    var index = this._i;
    var point;
    if (index >= O.length) return { value: undefined, done: true };
    point = $at$1(O, index);
    this._i += point.length;
    return { value: point, done: false };
  });

  // getting tag from 19.1.3.6 Object.prototype.toString()

  var TAG$1$1 = _wks$1('toStringTag');
  // ES3 wrong here
  var ARG = _cof$1(function () { return arguments; }()) == 'Arguments';

  // fallback for IE11 Script Access Denied error
  var tryGet = function (it, key) {
    try {
      return it[key];
    } catch (e) { /* empty */ }
  };

  var _classof = function (it) {
    var O, T, B;
    return it === undefined ? 'Undefined' : it === null ? 'Null'
      // @@toStringTag case
      : typeof (T = tryGet(O = Object(it), TAG$1$1)) == 'string' ? T
      // builtinTag case
      : ARG ? _cof$1(O)
      // ES3 arguments fallback
      : (B = _cof$1(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };

  var ITERATOR$1$1 = _wks$1('iterator');

  var core_getIteratorMethod = _core$1.getIteratorMethod = function (it) {
    if (it != undefined) return it[ITERATOR$1$1]
      || it['@@iterator']
      || _iterators[_classof(it)];
  };

  var core_getIterator = _core$1.getIterator = function (it) {
    var iterFn = core_getIteratorMethod(it);
    if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
    return _anObject$1(iterFn.call(it));
  };

  var getIterator = core_getIterator;

  var getIterator$1 = getIterator;

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = getIterator$1(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  var iterableToArrayLimit = _iterableToArrayLimit;

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var nonIterableRest = _nonIterableRest;

  function _slicedToArray(arr, i) {
    return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
  }

  var slicedToArray = _slicedToArray;

  function getSignStr(){var params=0<arguments.length&&void 0!==arguments[0]?arguments[0]:[[]],noKeys=[],strArray=[];return params.forEach(function(_ref){var _ref2=slicedToArray(_ref,2),key=_ref2[0],val=_ref2[1];if(0!==val&&!val)throw new Error("param.".concat(key," have not value! pls check!!"));0===key||key?strArray.push("".concat(key,"=").concat(val)):noKeys.push(val);}),"".concat(strArray.join("&")).concat(noKeys.join(""))}

  function defaultGetSignData(){var params=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},lastParams=1<arguments.length&&void 0!==arguments[1]?arguments[1]:[],filterData=sort(filterNull(params));if(!isArray_1$1(lastParams))throw new Error("The second argument is not Array or no value in defaultGetSignData function!");return lastParams.forEach(function(param){if(isObject_1$1(param)){if(!isObject_1$1(param)||isEmpty_1(param))throw new Error("The second argument's is not object or no value in defaultGetSignData function!");entries$1(param).forEach(function(_ref){var _ref2=slicedToArray(_ref,2),key=_ref2[0],val=_ref2[1];filterData.push([key,val]);});}else{if(0!==param&&!param)throw new Error("The second argument's no value in defaultGetSignData function!");filterData.push(["",param]);}}),getSignStr(filterData)}

  function defaultSign(){var params=0<arguments.length&&arguments[0]!==void 0?arguments[0]:{},lastParams=1<arguments.length&&arguments[1]!==void 0?arguments[1]:[],signStr=defaultGetSignData(params,lastParams);return _256().update(signStr).digest("hex")}

  function ownKeys$1(object,enumerableOnly){var keys=Object.keys(object);if(Object.getOwnPropertySymbols){var symbols=Object.getOwnPropertySymbols(object);enumerableOnly&&(symbols=symbols.filter(function(sym){return Object.getOwnPropertyDescriptor(object,sym).enumerable})),keys.push.apply(keys,symbols);}return keys}function _objectSpread$1(target){for(var source,i=1;i<arguments.length;i++)source=null==arguments[i]?{}:arguments[i],i%2?ownKeys$1(source,!0).forEach(function(key){defineProperty(target,key,source[key]);}):Object.getOwnPropertyDescriptors?Object.defineProperties(target,Object.getOwnPropertyDescriptors(source)):ownKeys$1(source).forEach(function(key){Object.defineProperty(target,key,Object.getOwnPropertyDescriptor(source,key));});return target}function vsApi(){var _ref=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{apiList:{}},_ref$baseURL=_ref.baseURL,baseURL=void 0===_ref$baseURL?"":_ref$baseURL,_ref$env=_ref.env,env=void 0===_ref$env?"weapp":_ref$env,_ref$appKey=_ref.appKey,appKey=void 0===_ref$appKey?"":_ref$appKey,_ref$appCode=_ref.appCode,appCode=void 0===_ref$appCode?"":_ref$appCode,apiList=_ref.apiList,_resInterceptor=_ref.resInterceptor,_openResInterceptor=_ref.openResInterceptor,_resSuccessCallback=_ref.resSuccessCallback,_ref$headers=_ref.headers,headers=void 0===_ref$headers?{"Content-Type":"application/json"}:_ref$headers,api=new Api({baseURL:baseURL,env:env,timeout:1e4,headers:headers,resSuccessCallback:function resSuccessCallback(data,next){return _resSuccessCallback&&"function"==typeof _resSuccessCallback?_resSuccessCallback(data,next):200===data.retcode?next(null,data.data,data.retcode):next({msg:data.msg,retcode:data.retcode},{},data.retcode)},openResInterceptor:function openResInterceptor(res){return "function"==typeof _openResInterceptor&&_openResInterceptor.call(this,res)},resInterceptor:function resInterceptor(serverData,next){return "function"==typeof _resInterceptor?_resInterceptor.bind(this)(serverData,next):next()}},apiList);return api._before=function(apiOpts,apiConf,next){var signKeys=apiConf.signKeys,signData={},data=apiOpts.data;data||(data={}),data.app_key=appKey,Object.keys(data).forEach(function(item){-1<signKeys.indexOf(item)&&(data[item]||0===data[item])&&(signData[item]=data[item]);});try{data.sign=defaultSign(signData,[appCode]);}catch(e){console.error(e),data.sign="";}next(_objectSpread$1({},apiOpts,{data:data}));},api}

  return vsApi;

}));
//# sourceMappingURL=cnfapi-mini-vs.dev.js.map
