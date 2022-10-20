/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/events/events.js":
/*!***************************************!*\
  !*** ./node_modules/events/events.js ***!
  \***************************************/
/***/ ((module) => {

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.



var R = typeof Reflect === 'object' ? Reflect : null
var ReflectApply = R && typeof R.apply === 'function'
  ? R.apply
  : function ReflectApply(target, receiver, args) {
    return Function.prototype.apply.call(target, receiver, args);
  }

var ReflectOwnKeys
if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target)
      .concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
}

function EventEmitter() {
  EventEmitter.init.call(this);
}
module.exports = EventEmitter;
module.exports.once = once;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function() {
    return defaultMaxListeners;
  },
  set: function(arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }
    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function() {

  if (this._events === undefined ||
      this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
};

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }
  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];
  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);
  var doError = (type === 'error');

  var events = this._events;
  if (events !== undefined)
    doError = (doError && events.error === undefined);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    var er;
    if (args.length > 0)
      er = args[0];
    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    }
    // At least give some kind of context to the user
    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];

  if (handler === undefined)
    return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  checkListener(listener);

  events = target._events;
  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type,
                  listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
        prepend ? [listener, existing] : [existing, listener];
      // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    }

    // Check for listener leak
    m = _getMaxListeners(target);
    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true;
      // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax
      var w = new Error('Possible EventEmitter memory leak detected. ' +
                          existing.length + ' ' + String(type) + ' listeners ' +
                          'added. Use emitter.setMaxListeners() to ' +
                          'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0)
      return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      checkListener(listener);
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      checkListener(listener);

      events = this._events;
      if (events === undefined)
        return this;

      list = events[type];
      if (list === undefined)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = Object.create(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else {
          spliceOne(list, position);
        }

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener !== undefined)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (events === undefined)
        return this;

      // not listening for removeListener, no need to emit
      if (events.removeListener === undefined) {
        if (arguments.length === 0) {
          this._events = Object.create(null);
          this._eventsCount = 0;
        } else if (events[type] !== undefined) {
          if (--this._eventsCount === 0)
            this._events = Object.create(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = Object.keys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = Object.create(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners !== undefined) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (events === undefined)
    return [];

  var evlistener = events[type];
  if (evlistener === undefined)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ?
    unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
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

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++)
    list[index] = list[index + 1];
  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function once(emitter, name) {
  return new Promise(function (resolve, reject) {
    function errorListener(err) {
      emitter.removeListener(name, resolver);
      reject(err);
    }

    function resolver() {
      if (typeof emitter.removeListener === 'function') {
        emitter.removeListener('error', errorListener);
      }
      resolve([].slice.call(arguments));
    };

    eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
    if (name !== 'error') {
      addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
    }
  });
}

function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
  if (typeof emitter.on === 'function') {
    eventTargetAgnosticAddListener(emitter, 'error', handler, flags);
  }
}

function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
  if (typeof emitter.on === 'function') {
    if (flags.once) {
      emitter.once(name, listener);
    } else {
      emitter.on(name, listener);
    }
  } else if (typeof emitter.addEventListener === 'function') {
    // EventTarget does not have `error` event semantics like Node
    // EventEmitters, we do not listen for `error` events here.
    emitter.addEventListener(name, function wrapListener(arg) {
      // IE does not have builtin `{ once: true }` support so we
      // have to do it manually.
      if (flags.once) {
        emitter.removeEventListener(name, wrapListener);
      }
      listener(arg);
    });
  } else {
    throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
  }
}


/***/ }),

/***/ "./src/dropHandler.ts":
/*!****************************!*\
  !*** ./src/dropHandler.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();

// A small helper class that registers drag&drop events on the given
// element and emits an event for every gif that is dropped.
var DropHandler = /** @class */ (function (_super) {
    __extends(DropHandler, _super);
    function DropHandler(id) {
        var _this = _super.call(this) || this;
        _this._node = document.getElementById(id);
        _this._node.addEventListener('dragover', function (e) { return _this.handleDragOver(e); }, false);
        _this._node.addEventListener('drop', function (e) { return _this.handleDrop(e); }, false);
        return _this;
    }
    DropHandler.prototype._preventDefault = function (event) {
        event.stopPropagation();
        event.preventDefault();
    };
    DropHandler.prototype.handleDrop = function (event) {
        var _this = this;
        this._preventDefault(event);
        Array.from(event.dataTransfer.files)
            .filter(function (file) { return file.type === 'image/gif'; })
            .forEach(function (gif) { return _this.emit('drop', gif); });
    };
    DropHandler.prototype.handleDragOver = function (event) {
        this._preventDefault(event);
    };
    return DropHandler;
}(events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter));
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (DropHandler);


/***/ }),

/***/ "./src/fileConverter.ts":
/*!******************************!*\
  !*** ./src/fileConverter.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
// The FileReader reads files and returns their content in
// a buffer.
var FileConverter = /** @class */ (function () {
    function FileConverter() {
    }
    // Reads the file and returns the content as a Uint8Array
    // wrapped inside a Promise.
    FileConverter.readAsByteArray = function (file) {
        return new Promise(function (resolve) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var fileReader = event.target;
                var buffer = fileReader.result;
                resolve(new Uint8Array(buffer));
            };
            reader.readAsArrayBuffer(file);
        });
    };
    // Reads the file or blob and returns a string containing a data
    // url that can be assigned to and img's src attribute.
    FileConverter.readAsDataUrl = function (file) {
        return new Promise(function (resolve) {
            var reader = new FileReader();
            reader.onload = function (event) {
                var fileReader = event.target;
                var buffer = fileReader.result;
                resolve(buffer);
            };
            reader.readAsDataURL(file);
        });
    };
    // Converts a Uint8Array into a data url with the given mime type. Default
    // type is `'image/gif'`.
    FileConverter.convertToDataUrl = function (data, type) {
        if (type === void 0) { type = 'image/gif'; }
        var blob = new Blob([data], { type: type });
        return this.readAsDataUrl(blob);
    };
    return FileConverter;
}());
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (FileConverter);


/***/ }),

/***/ "./src/gifDisplay.ts":
/*!***************************!*\
  !*** ./src/gifDisplay.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GifDisplay": () => (/* binding */ GifDisplay),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
var GifDisplay = /** @class */ (function () {
    function GifDisplay(name, root) {
        this.name = name;
        this._root = document.getElementById(root);
        this._progress = document.createElement('progress');
        this._progress.classList.add('gif-progress');
        var title = document.createElement('h3'), titleText = document.createTextNode(name);
        title.appendChild(titleText);
        this._container = document.createElement('div');
        this._container.classList.add('single-result');
        this._container.appendChild(title);
        this._container.appendChild(this._progress);
        if (this._root.childNodes.length > 0) {
            this._root.insertBefore(this._container, this._root.childNodes[0]);
        }
        else {
            this._root.appendChild(this._container);
        }
    }
    GifDisplay.prototype.updateProgress = function (current, max) {
        this._progress.max = max;
        this._progress.value = current;
    };
    GifDisplay.prototype._createImage = function (src, filename) {
        var image = document.createElement('img');
        image.src = src;
        var link = document.createElement('a');
        link.href = src;
        link.download = filename;
        link.appendChild(image);
        return link;
    };
    GifDisplay.prototype.showGifs = function (filename, original, reversed) {
        this._container.removeChild(this._progress);
        var originalGif = this._createImage(original, filename), reversedGif = this._createImage(reversed, "".concat(filename, "-reversed.gif"));
        this._container.appendChild(originalGif);
        this._container.appendChild(reversedGif);
    };
    GifDisplay.prototype.showError = function (message, stack) {
        this._container.removeChild(this._progress);
        var errorDisplay = document.createElement('div');
        errorDisplay.innerHTML = "\n    <div class=\"error\">\n      It seems like I can't reverse that gif. Here are some details if you want to\n      <a class=\"error\" href=\"https://github.com/migerh/rustwasm-gif/issues/new\">file an issue</a>:\n    </div>\n    <div class=\"error\">\n      ".concat(message, "\n    </div>\n    <div>\n      ").concat(stack.replace(/\n/g, '<br />'), "\n    </div>");
        this._container.appendChild(errorDisplay);
    };
    return GifDisplay;
}());

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GifDisplay);


/***/ }),

/***/ "./src/gifReverser.ts":
/*!****************************!*\
  !*** ./src/gifReverser.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "GifReversalJob": () => (/* binding */ GifReversalJob),
/* harmony export */   "GifReverser": () => (/* binding */ GifReverser),
/* harmony export */   "ProcessingErrorEvent": () => (/* binding */ ProcessingErrorEvent),
/* harmony export */   "ProgressEvent": () => (/* binding */ ProgressEvent),
/* harmony export */   "ReversedGif": () => (/* binding */ ReversedGif),
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var uuid__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! uuid */ "./node_modules/uuid/dist/esm-browser/v4.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! events */ "./node_modules/events/events.js");
/* harmony import */ var events__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(events__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _fileConverter__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./fileConverter */ "./src/fileConverter.ts");
var __extends = (undefined && undefined.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (undefined && undefined.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (undefined && undefined.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};



var GifReverser = /** @class */ (function () {
    function GifReverser() {
        var _this = this;
        this._numberOfWorkers = navigator.hardwareConcurrency || 2;
        this._jobs = [];
        this._jobsWaitingForWorker = [];
        this._workers = Array.from(Array(this._numberOfWorkers).keys()).map(function () { return new Worker(new URL(/* worker import */ __webpack_require__.p + __webpack_require__.u("src_processing_worker_js"), __webpack_require__.b)); });
        this._workers.forEach(function (w) { return w.onmessage = _this._handleMessage.bind(_this); });
        this._workers.forEach(function (w) { return w.onerror = _this._handleError.bind(_this); });
        this._availableWorkers = __spreadArray([], this._workers, true);
        this._busyWorkers = [];
    }
    GifReverser.prototype._findJobById = function (id) {
        return this._jobs.find(function (j) { return j.id === id; });
    };
    GifReverser.prototype._removeJobById = function (id) {
        this._jobs = this._jobs.filter(function (j) { return j.id !== id; });
    };
    GifReverser.prototype._getNextWorker = function () {
        var worker = this._availableWorkers.pop();
        this._busyWorkers.push(worker);
        return worker;
    };
    GifReverser.prototype._getNextJob = function () {
        var job = this._jobsWaitingForWorker.shift();
        this._jobs.push(job);
        return job;
    };
    GifReverser.prototype._makeWorkerAvailable = function (worker) {
        this._busyWorkers = this._busyWorkers.filter(function (w) { return w !== worker; });
        this._availableWorkers.push(worker);
    };
    GifReverser.prototype._assignJobToWorker = function (job, worker) {
        worker.postMessage(job.getMessageForWorker());
    };
    GifReverser.prototype._distributeJobs = function () {
        var numberOfAvailableWorkers = this._availableWorkers.length, numberOfWaitingJobs = this._jobsWaitingForWorker.length, jobsToDistribute = Math.min(numberOfAvailableWorkers, numberOfWaitingJobs);
        for (var i = 0; i < jobsToDistribute; ++i) {
            this._assignJobToWorker(this._getNextJob(), this._getNextWorker());
        }
    };
    GifReverser.prototype._handleMessage = function (event) {
        var data = event.data, id = data.id, job = this._findJobById(id);
        switch (data.type) {
            case 'register_progress':
                job.numberOfFrames = data.numberOfFrames;
                break;
            case 'report_progress':
                job.emit('progress', __assign(__assign({}, data), { numberOfFrames: job.numberOfFrames }));
                break;
            case 'finished':
                this._removeJobById(id);
                this._makeWorkerAvailable(event.target);
                this._distributeJobs();
                job.emit('finished', data);
                break;
            case 'error':
                this._removeJobById(id);
                this._makeWorkerAvailable(event.target);
                this._distributeJobs();
                job.emit('error', data);
        }
    };
    // todo: route errors to the right job
    GifReverser.prototype._handleError = function (event) {
        event.preventDefault();
        console.error('An error occurred initializing the worker:', event.message, event.error);
    };
    GifReverser.prototype.process = function (file) {
        return __awaiter(this, void 0, void 0, function () {
            var buffer, name, id, job;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _fileConverter__WEBPACK_IMPORTED_MODULE_1__["default"].readAsByteArray(file)];
                    case 1:
                        buffer = _a.sent(), name = file.name, id = (0,uuid__WEBPACK_IMPORTED_MODULE_2__["default"])(), job = new GifReversalJob(id, name, buffer);
                        this._jobsWaitingForWorker.push(job);
                        this._distributeJobs();
                        return [2 /*return*/, job];
                }
            });
        });
    };
    return GifReverser;
}());

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (GifReverser);
var GifReversalJob = /** @class */ (function (_super) {
    __extends(GifReversalJob, _super);
    function GifReversalJob(id, name, buffer) {
        var _this = _super.call(this) || this;
        _this.id = id;
        _this.name = name;
        _this.buffer = buffer;
        return _this;
    }
    GifReversalJob.prototype.getMessageForWorker = function () {
        var _a = this, id = _a.id, name = _a.name, buffer = _a.buffer;
        return { id: id, name: name, buffer: buffer };
    };
    return GifReversalJob;
}(events__WEBPACK_IMPORTED_MODULE_0__.EventEmitter));

var ProgressEvent = /** @class */ (function () {
    function ProgressEvent() {
    }
    return ProgressEvent;
}());

var ProcessingErrorEvent = /** @class */ (function () {
    function ProcessingErrorEvent() {
    }
    return ProcessingErrorEvent;
}());

var ReversedGif = /** @class */ (function () {
    function ReversedGif() {
    }
    return ReversedGif;
}());



/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/native.js":
/*!******************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/native.js ***!
  \******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  randomUUID
});

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/regex.js":
/*!*****************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/regex.js ***!
  \*****************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (/^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/rng.js":
/*!***************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/rng.js ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ rng)
/* harmony export */ });
// Unique ID creation requires a high quality random # generator. In the browser we therefore
// require the crypto API and do not support built-in fallback to lower quality random number
// generators (like Math.random()).
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
  // lazy load so that environments that need to polyfill have a chance to do so
  if (!getRandomValues) {
    // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation.
    getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);

    if (!getRandomValues) {
      throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
    }
  }

  return getRandomValues(rnds8);
}

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/stringify.js":
/*!*********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/stringify.js ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__),
/* harmony export */   "unsafeStringify": () => (/* binding */ unsafeStringify)
/* harmony export */ });
/* harmony import */ var _validate_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./validate.js */ "./node_modules/uuid/dist/esm-browser/validate.js");

/**
 * Convert array of 16 byte values to UUID string format of the form:
 * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
 */

const byteToHex = [];

for (let i = 0; i < 256; ++i) {
  byteToHex.push((i + 0x100).toString(16).slice(1));
}

function unsafeStringify(arr, offset = 0) {
  // Note: Be careful editing this code!  It's been tuned for performance
  // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
  return (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase();
}

function stringify(arr, offset = 0) {
  const uuid = unsafeStringify(arr, offset); // Consistency check for valid UUID.  If this throws, it's likely due to one
  // of the following:
  // - One or more input array values don't map to a hex octet (leading to
  // "undefined" in the uuid)
  // - Invalid input values for the RFC `version` or `variant` fields

  if (!(0,_validate_js__WEBPACK_IMPORTED_MODULE_0__["default"])(uuid)) {
    throw TypeError('Stringified UUID is invalid');
  }

  return uuid;
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (stringify);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/v4.js":
/*!**************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/v4.js ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _native_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./native.js */ "./node_modules/uuid/dist/esm-browser/native.js");
/* harmony import */ var _rng_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./rng.js */ "./node_modules/uuid/dist/esm-browser/rng.js");
/* harmony import */ var _stringify_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./stringify.js */ "./node_modules/uuid/dist/esm-browser/stringify.js");




function v4(options, buf, offset) {
  if (_native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID && !buf && !options) {
    return _native_js__WEBPACK_IMPORTED_MODULE_0__["default"].randomUUID();
  }

  options = options || {};
  const rnds = options.random || (options.rng || _rng_js__WEBPACK_IMPORTED_MODULE_1__["default"])(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

  rnds[6] = rnds[6] & 0x0f | 0x40;
  rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

  if (buf) {
    offset = offset || 0;

    for (let i = 0; i < 16; ++i) {
      buf[offset + i] = rnds[i];
    }

    return buf;
  }

  return (0,_stringify_js__WEBPACK_IMPORTED_MODULE_2__.unsafeStringify)(rnds);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (v4);

/***/ }),

/***/ "./node_modules/uuid/dist/esm-browser/validate.js":
/*!********************************************************!*\
  !*** ./node_modules/uuid/dist/esm-browser/validate.js ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _regex_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./regex.js */ "./node_modules/uuid/dist/esm-browser/regex.js");


function validate(uuid) {
  return typeof uuid === 'string' && _regex_js__WEBPACK_IMPORTED_MODULE_0__["default"].test(uuid);
}

/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (validate);

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".main.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/jsonp chunk loading */
/******/ 	(() => {
/******/ 		__webpack_require__.b = document.baseURI || self.location.href;
/******/ 		
/******/ 		// object to store loaded and loading chunks
/******/ 		// undefined = chunk not loaded, null = chunk preloaded/prefetched
/******/ 		// [resolve, reject, Promise] = chunk loading, 0 = chunk loaded
/******/ 		var installedChunks = {
/******/ 			"main": 0
/******/ 		};
/******/ 		
/******/ 		// no chunk on demand loading
/******/ 		
/******/ 		// no prefetching
/******/ 		
/******/ 		// no preloaded
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 		
/******/ 		// no on chunks loaded
/******/ 		
/******/ 		// no jsonp function
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _dropHandler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./dropHandler */ "./src/dropHandler.ts");
/* harmony import */ var _gifReverser__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./gifReverser */ "./src/gifReverser.ts");
/* harmony import */ var _fileConverter__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./fileConverter */ "./src/fileConverter.ts");
/* harmony import */ var _gifDisplay__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./gifDisplay */ "./src/gifDisplay.ts");
var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (undefined && undefined.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};




// This glues everything together. The Drophandler listens for drop events on
// the drop html element. Once a gif drops it will be passed over to the
// gif processor. Once the gif processor is finished reversing the gif we
// display it. To ensure that everything is properly initialized, we set
// everything up backwards.
// First we initialize the gif processor and…
var gifProcessor = new _gifReverser__WEBPACK_IMPORTED_MODULE_1__.GifReverser(), rootNodeId = 'resultContainer';
// …define what happens when a job is finished.
var createJobFinishedHandler = function (display) { return function (data) {
    return __awaiter(this, void 0, void 0, function () {
        var name, buffer, reversedBuffer, originalGifData, reversedGifData;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    name = data.name, buffer = data.buffer, reversedBuffer = data.reversedBuffer;
                    return [4 /*yield*/, _fileConverter__WEBPACK_IMPORTED_MODULE_2__["default"].convertToDataUrl(buffer)];
                case 1:
                    originalGifData = _a.sent();
                    return [4 /*yield*/, _fileConverter__WEBPACK_IMPORTED_MODULE_2__["default"].convertToDataUrl(reversedBuffer)];
                case 2:
                    reversedGifData = _a.sent();
                    display.showGifs(name, originalGifData, reversedGifData);
                    return [2 /*return*/];
            }
        });
    });
}; };
// Then we define what happens on a progress event.
var createJobProgressHandler = function (display) { return function (item) {
    display.updateProgress(item.currentFrame, item.numberOfFrames);
}; };
var createErrorHandler = function (display) { return function (event) {
    var message = event.message, stack = event.stack;
    display.showError(message, stack);
}; };
// Finally we set up the trigger for everything above.
var dropHandler = new _dropHandler__WEBPACK_IMPORTED_MODULE_0__["default"]('gif-file-drop');
dropHandler.on('drop', function handleDrop(file) {
    return __awaiter(this, void 0, void 0, function () {
        var job, display;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, gifProcessor.process(file)];
                case 1:
                    job = _a.sent(), display = new _gifDisplay__WEBPACK_IMPORTED_MODULE_3__.GifDisplay(file.name, rootNodeId);
                    job.on('progress', createJobProgressHandler(display));
                    job.on('finished', createJobFinishedHandler(display));
                    job.on('error', createErrorHandler(display));
                    return [2 /*return*/];
            }
        });
    });
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUFBRSxLQUFLLENBQUMsQ0FBQztBQUNwQyxDQUFDLEVBSG1ELENBR25ELENBQUM7QUFFRixzREFBc0Q7QUFDdEQsSUFBTSxXQUFXLEdBQUcsSUFBSSxvREFBVyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3JELFdBQVcsQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFNBQWUsVUFBVSxDQUFDLElBQVU7Ozs7O3dCQUU3QyxxQkFBTSxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQzs7b0JBQXRDLEdBQUcsR0FBRyxTQUFnQyxFQUMxQyxPQUFPLEdBQUcsSUFBSSxtREFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsVUFBVSxDQUFDO29CQUVqRCxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUN0RCxHQUFHLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSx3QkFBd0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO29CQUN0RCxHQUFHLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDOzs7OztDQUM5QyxDQUFDLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvZHJvcEhhbmRsZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2ZpbGVDb252ZXJ0ZXIudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dpZkRpc3BsYXkudHMiLCJ3ZWJwYWNrOi8vLy4vc3JjL2dpZlJldmVyc2VyLnRzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvbmF0aXZlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy91dWlkL2Rpc3QvZXNtLWJyb3dzZXIvcmVnZXguanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9ybmcuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci9zdHJpbmdpZnkuanMiLCJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL3V1aWQvZGlzdC9lc20tYnJvd3Nlci92NC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvdXVpZC9kaXN0L2VzbS1icm93c2VyL3ZhbGlkYXRlLmpzIiwid2VicGFjazovLy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2NvbXBhdCBnZXQgZGVmYXVsdCBleHBvcnQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2dldCBqYXZhc2NyaXB0IGNodW5rIGZpbGVuYW1lIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZ2xvYmFsIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvcHVibGljUGF0aCIsIndlYnBhY2s6Ly8vd2VicGFjay9ydW50aW1lL2pzb25wIGNodW5rIGxvYWRpbmciLCJ3ZWJwYWNrOi8vLy4vc3JjL2luZGV4LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBSID0gdHlwZW9mIFJlZmxlY3QgPT09ICdvYmplY3QnID8gUmVmbGVjdCA6IG51bGxcbnZhciBSZWZsZWN0QXBwbHkgPSBSICYmIHR5cGVvZiBSLmFwcGx5ID09PSAnZnVuY3Rpb24nXG4gID8gUi5hcHBseVxuICA6IGZ1bmN0aW9uIFJlZmxlY3RBcHBseSh0YXJnZXQsIHJlY2VpdmVyLCBhcmdzKSB7XG4gICAgcmV0dXJuIEZ1bmN0aW9uLnByb3RvdHlwZS5hcHBseS5jYWxsKHRhcmdldCwgcmVjZWl2ZXIsIGFyZ3MpO1xuICB9XG5cbnZhciBSZWZsZWN0T3duS2V5c1xuaWYgKFIgJiYgdHlwZW9mIFIub3duS2V5cyA9PT0gJ2Z1bmN0aW9uJykge1xuICBSZWZsZWN0T3duS2V5cyA9IFIub3duS2V5c1xufSBlbHNlIGlmIChPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG4gIFJlZmxlY3RPd25LZXlzID0gZnVuY3Rpb24gUmVmbGVjdE93bktleXModGFyZ2V0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRhcmdldClcbiAgICAgIC5jb25jYXQoT2JqZWN0LmdldE93blByb3BlcnR5U3ltYm9scyh0YXJnZXQpKTtcbiAgfTtcbn0gZWxzZSB7XG4gIFJlZmxlY3RPd25LZXlzID0gZnVuY3Rpb24gUmVmbGVjdE93bktleXModGFyZ2V0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRhcmdldCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIFByb2Nlc3NFbWl0V2FybmluZyh3YXJuaW5nKSB7XG4gIGlmIChjb25zb2xlICYmIGNvbnNvbGUud2FybikgY29uc29sZS53YXJuKHdhcm5pbmcpO1xufVxuXG52YXIgTnVtYmVySXNOYU4gPSBOdW1iZXIuaXNOYU4gfHwgZnVuY3Rpb24gTnVtYmVySXNOYU4odmFsdWUpIHtcbiAgcmV0dXJuIHZhbHVlICE9PSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICBFdmVudEVtaXR0ZXIuaW5pdC5jYWxsKHRoaXMpO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5tb2R1bGUuZXhwb3J0cy5vbmNlID0gb25jZTtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHNDb3VudCA9IDA7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbnZhciBkZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbmZ1bmN0aW9uIGNoZWNrTGlzdGVuZXIobGlzdGVuZXIpIHtcbiAgaWYgKHR5cGVvZiBsaXN0ZW5lciAhPT0gJ2Z1bmN0aW9uJykge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RoZSBcImxpc3RlbmVyXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEZ1bmN0aW9uLiBSZWNlaXZlZCB0eXBlICcgKyB0eXBlb2YgbGlzdGVuZXIpO1xuICB9XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShFdmVudEVtaXR0ZXIsICdkZWZhdWx0TWF4TGlzdGVuZXJzJywge1xuICBlbnVtZXJhYmxlOiB0cnVlLFxuICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBkZWZhdWx0TWF4TGlzdGVuZXJzO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGFyZykge1xuICAgIGlmICh0eXBlb2YgYXJnICE9PSAnbnVtYmVyJyB8fCBhcmcgPCAwIHx8IE51bWJlcklzTmFOKGFyZykpIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdUaGUgdmFsdWUgb2YgXCJkZWZhdWx0TWF4TGlzdGVuZXJzXCIgaXMgb3V0IG9mIHJhbmdlLiBJdCBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIG51bWJlci4gUmVjZWl2ZWQgJyArIGFyZyArICcuJyk7XG4gICAgfVxuICAgIGRlZmF1bHRNYXhMaXN0ZW5lcnMgPSBhcmc7XG4gIH1cbn0pO1xuXG5FdmVudEVtaXR0ZXIuaW5pdCA9IGZ1bmN0aW9uKCkge1xuXG4gIGlmICh0aGlzLl9ldmVudHMgPT09IHVuZGVmaW5lZCB8fFxuICAgICAgdGhpcy5fZXZlbnRzID09PSBPYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykuX2V2ZW50cykge1xuICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgdGhpcy5fZXZlbnRzQ291bnQgPSAwO1xuICB9XG5cbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn07XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIHNldE1heExpc3RlbmVycyhuKSB7XG4gIGlmICh0eXBlb2YgbiAhPT0gJ251bWJlcicgfHwgbiA8IDAgfHwgTnVtYmVySXNOYU4obikpIHtcbiAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcignVGhlIHZhbHVlIG9mIFwiblwiIGlzIG91dCBvZiByYW5nZS4gSXQgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBudW1iZXIuIFJlY2VpdmVkICcgKyBuICsgJy4nKTtcbiAgfVxuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbmZ1bmN0aW9uIF9nZXRNYXhMaXN0ZW5lcnModGhhdCkge1xuICBpZiAodGhhdC5fbWF4TGlzdGVuZXJzID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICByZXR1cm4gdGhhdC5fbWF4TGlzdGVuZXJzO1xufVxuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmdldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uIGdldE1heExpc3RlbmVycygpIHtcbiAgcmV0dXJuIF9nZXRNYXhMaXN0ZW5lcnModGhpcyk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbiBlbWl0KHR5cGUpIHtcbiAgdmFyIGFyZ3MgPSBbXTtcbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIGFyZ3MucHVzaChhcmd1bWVudHNbaV0pO1xuICB2YXIgZG9FcnJvciA9ICh0eXBlID09PSAnZXJyb3InKTtcblxuICB2YXIgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICBpZiAoZXZlbnRzICE9PSB1bmRlZmluZWQpXG4gICAgZG9FcnJvciA9IChkb0Vycm9yICYmIGV2ZW50cy5lcnJvciA9PT0gdW5kZWZpbmVkKTtcbiAgZWxzZSBpZiAoIWRvRXJyb3IpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKGRvRXJyb3IpIHtcbiAgICB2YXIgZXI7XG4gICAgaWYgKGFyZ3MubGVuZ3RoID4gMClcbiAgICAgIGVyID0gYXJnc1swXTtcbiAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgLy8gTm90ZTogVGhlIGNvbW1lbnRzIG9uIHRoZSBgdGhyb3dgIGxpbmVzIGFyZSBpbnRlbnRpb25hbCwgdGhleSBzaG93XG4gICAgICAvLyB1cCBpbiBOb2RlJ3Mgb3V0cHV0IGlmIHRoaXMgcmVzdWx0cyBpbiBhbiB1bmhhbmRsZWQgZXhjZXB0aW9uLlxuICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgfVxuICAgIC8vIEF0IGxlYXN0IGdpdmUgc29tZSBraW5kIG9mIGNvbnRleHQgdG8gdGhlIHVzZXJcbiAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdVbmhhbmRsZWQgZXJyb3IuJyArIChlciA/ICcgKCcgKyBlci5tZXNzYWdlICsgJyknIDogJycpKTtcbiAgICBlcnIuY29udGV4dCA9IGVyO1xuICAgIHRocm93IGVycjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgfVxuXG4gIHZhciBoYW5kbGVyID0gZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChoYW5kbGVyID09PSB1bmRlZmluZWQpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmICh0eXBlb2YgaGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIFJlZmxlY3RBcHBseShoYW5kbGVyLCB0aGlzLCBhcmdzKTtcbiAgfSBlbHNlIHtcbiAgICB2YXIgbGVuID0gaGFuZGxlci5sZW5ndGg7XG4gICAgdmFyIGxpc3RlbmVycyA9IGFycmF5Q2xvbmUoaGFuZGxlciwgbGVuKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbjsgKytpKVxuICAgICAgUmVmbGVjdEFwcGx5KGxpc3RlbmVyc1tpXSwgdGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbmZ1bmN0aW9uIF9hZGRMaXN0ZW5lcih0YXJnZXQsIHR5cGUsIGxpc3RlbmVyLCBwcmVwZW5kKSB7XG4gIHZhciBtO1xuICB2YXIgZXZlbnRzO1xuICB2YXIgZXhpc3Rpbmc7XG5cbiAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG4gIGlmIChldmVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgIGV2ZW50cyA9IHRhcmdldC5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICB0YXJnZXQuX2V2ZW50c0NvdW50ID0gMDtcbiAgfSBlbHNlIHtcbiAgICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAgIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgICBpZiAoZXZlbnRzLm5ld0xpc3RlbmVyICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHRhcmdldC5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA/IGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gICAgICAvLyBSZS1hc3NpZ24gYGV2ZW50c2AgYmVjYXVzZSBhIG5ld0xpc3RlbmVyIGhhbmRsZXIgY291bGQgaGF2ZSBjYXVzZWQgdGhlXG4gICAgICAvLyB0aGlzLl9ldmVudHMgdG8gYmUgYXNzaWduZWQgdG8gYSBuZXcgb2JqZWN0XG4gICAgICBldmVudHMgPSB0YXJnZXQuX2V2ZW50cztcbiAgICB9XG4gICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV07XG4gIH1cblxuICBpZiAoZXhpc3RpbmcgPT09IHVuZGVmaW5lZCkge1xuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIGV4aXN0aW5nID0gZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gICAgKyt0YXJnZXQuX2V2ZW50c0NvdW50O1xuICB9IGVsc2Uge1xuICAgIGlmICh0eXBlb2YgZXhpc3RpbmcgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgICAgZXhpc3RpbmcgPSBldmVudHNbdHlwZV0gPVxuICAgICAgICBwcmVwZW5kID8gW2xpc3RlbmVyLCBleGlzdGluZ10gOiBbZXhpc3RpbmcsIGxpc3RlbmVyXTtcbiAgICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB9IGVsc2UgaWYgKHByZXBlbmQpIHtcbiAgICAgIGV4aXN0aW5nLnVuc2hpZnQobGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBleGlzdGluZy5wdXNoKGxpc3RlbmVyKTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICAgIG0gPSBfZ2V0TWF4TGlzdGVuZXJzKHRhcmdldCk7XG4gICAgaWYgKG0gPiAwICYmIGV4aXN0aW5nLmxlbmd0aCA+IG0gJiYgIWV4aXN0aW5nLndhcm5lZCkge1xuICAgICAgZXhpc3Rpbmcud2FybmVkID0gdHJ1ZTtcbiAgICAgIC8vIE5vIGVycm9yIGNvZGUgZm9yIHRoaXMgc2luY2UgaXQgaXMgYSBXYXJuaW5nXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tcmVzdHJpY3RlZC1zeW50YXhcbiAgICAgIHZhciB3ID0gbmV3IEVycm9yKCdQb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5IGxlYWsgZGV0ZWN0ZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZy5sZW5ndGggKyAnICcgKyBTdHJpbmcodHlwZSkgKyAnIGxpc3RlbmVycyAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FkZGVkLiBVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2luY3JlYXNlIGxpbWl0Jyk7XG4gICAgICB3Lm5hbWUgPSAnTWF4TGlzdGVuZXJzRXhjZWVkZWRXYXJuaW5nJztcbiAgICAgIHcuZW1pdHRlciA9IHRhcmdldDtcbiAgICAgIHcudHlwZSA9IHR5cGU7XG4gICAgICB3LmNvdW50ID0gZXhpc3RpbmcubGVuZ3RoO1xuICAgICAgUHJvY2Vzc0VtaXRXYXJuaW5nKHcpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0YXJnZXQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbiBhZGRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICByZXR1cm4gX2FkZExpc3RlbmVyKHRoaXMsIHR5cGUsIGxpc3RlbmVyLCBmYWxzZSk7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHByZXBlbmRMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcikge1xuICAgICAgcmV0dXJuIF9hZGRMaXN0ZW5lcih0aGlzLCB0eXBlLCBsaXN0ZW5lciwgdHJ1ZSk7XG4gICAgfTtcblxuZnVuY3Rpb24gb25jZVdyYXBwZXIoKSB7XG4gIGlmICghdGhpcy5maXJlZCkge1xuICAgIHRoaXMudGFyZ2V0LnJlbW92ZUxpc3RlbmVyKHRoaXMudHlwZSwgdGhpcy53cmFwRm4pO1xuICAgIHRoaXMuZmlyZWQgPSB0cnVlO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuY2FsbCh0aGlzLnRhcmdldCk7XG4gICAgcmV0dXJuIHRoaXMubGlzdGVuZXIuYXBwbHkodGhpcy50YXJnZXQsIGFyZ3VtZW50cyk7XG4gIH1cbn1cblxuZnVuY3Rpb24gX29uY2VXcmFwKHRhcmdldCwgdHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIHN0YXRlID0geyBmaXJlZDogZmFsc2UsIHdyYXBGbjogdW5kZWZpbmVkLCB0YXJnZXQ6IHRhcmdldCwgdHlwZTogdHlwZSwgbGlzdGVuZXI6IGxpc3RlbmVyIH07XG4gIHZhciB3cmFwcGVkID0gb25jZVdyYXBwZXIuYmluZChzdGF0ZSk7XG4gIHdyYXBwZWQubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgc3RhdGUud3JhcEZuID0gd3JhcHBlZDtcbiAgcmV0dXJuIHdyYXBwZWQ7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uIG9uY2UodHlwZSwgbGlzdGVuZXIpIHtcbiAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG4gIHRoaXMub24odHlwZSwgX29uY2VXcmFwKHRoaXMsIHR5cGUsIGxpc3RlbmVyKSk7XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5wcmVwZW5kT25jZUxpc3RlbmVyID1cbiAgICBmdW5jdGlvbiBwcmVwZW5kT25jZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICBjaGVja0xpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgIHRoaXMucHJlcGVuZExpc3RlbmVyKHR5cGUsIF9vbmNlV3JhcCh0aGlzLCB0eXBlLCBsaXN0ZW5lcikpO1xuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuLy8gRW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmIGFuZCBvbmx5IGlmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPVxuICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyKSB7XG4gICAgICB2YXIgbGlzdCwgZXZlbnRzLCBwb3NpdGlvbiwgaSwgb3JpZ2luYWxMaXN0ZW5lcjtcblxuICAgICAgY2hlY2tMaXN0ZW5lcihsaXN0ZW5lcik7XG5cbiAgICAgIGV2ZW50cyA9IHRoaXMuX2V2ZW50cztcbiAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZClcbiAgICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICAgIGxpc3QgPSBldmVudHNbdHlwZV07XG4gICAgICBpZiAobGlzdCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8IGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSB7XG4gICAgICAgIGlmICgtLXRoaXMuX2V2ZW50c0NvdW50ID09PSAwKVxuICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgIGRlbGV0ZSBldmVudHNbdHlwZV07XG4gICAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0Lmxpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgbGlzdCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBwb3NpdGlvbiA9IC0xO1xuXG4gICAgICAgIGZvciAoaSA9IGxpc3QubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHwgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpIHtcbiAgICAgICAgICAgIG9yaWdpbmFsTGlzdGVuZXIgPSBsaXN0W2ldLmxpc3RlbmVyO1xuICAgICAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgICBpZiAocG9zaXRpb24gPT09IDApXG4gICAgICAgICAgbGlzdC5zaGlmdCgpO1xuICAgICAgICBlbHNlIHtcbiAgICAgICAgICBzcGxpY2VPbmUobGlzdCwgcG9zaXRpb24pO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKVxuICAgICAgICAgIGV2ZW50c1t0eXBlXSA9IGxpc3RbMF07XG5cbiAgICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lciAhPT0gdW5kZWZpbmVkKVxuICAgICAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBvcmlnaW5hbExpc3RlbmVyIHx8IGxpc3RlbmVyKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vZmYgPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9XG4gICAgZnVuY3Rpb24gcmVtb3ZlQWxsTGlzdGVuZXJzKHR5cGUpIHtcbiAgICAgIHZhciBsaXN0ZW5lcnMsIGV2ZW50cywgaTtcblxuICAgICAgZXZlbnRzID0gdGhpcy5fZXZlbnRzO1xuICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgICAgICByZXR1cm4gdGhpcztcblxuICAgICAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICAgICAgaWYgKGV2ZW50cy5yZW1vdmVMaXN0ZW5lciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhpcy5fZXZlbnRzID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnRzW3R5cGVdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBpZiAoLS10aGlzLl9ldmVudHNDb3VudCA9PT0gMClcbiAgICAgICAgICAgIHRoaXMuX2V2ZW50cyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gICAgICAgICAgZWxzZVxuICAgICAgICAgICAgZGVsZXRlIGV2ZW50c1t0eXBlXTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgIH1cblxuICAgICAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKGV2ZW50cyk7XG4gICAgICAgIHZhciBrZXk7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgICAgICB0aGlzLl9ldmVudHMgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICAgICAgICB0aGlzLl9ldmVudHNDb3VudCA9IDA7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfVxuXG4gICAgICBsaXN0ZW5lcnMgPSBldmVudHNbdHlwZV07XG5cbiAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXJzID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgICAgIH0gZWxzZSBpZiAobGlzdGVuZXJzICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gTElGTyBvcmRlclxuICAgICAgICBmb3IgKGkgPSBsaXN0ZW5lcnMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tpXSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfTtcblxuZnVuY3Rpb24gX2xpc3RlbmVycyh0YXJnZXQsIHR5cGUsIHVud3JhcCkge1xuICB2YXIgZXZlbnRzID0gdGFyZ2V0Ll9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKVxuICAgIHJldHVybiBbXTtcblxuICB2YXIgZXZsaXN0ZW5lciA9IGV2ZW50c1t0eXBlXTtcbiAgaWYgKGV2bGlzdGVuZXIgPT09IHVuZGVmaW5lZClcbiAgICByZXR1cm4gW107XG5cbiAgaWYgKHR5cGVvZiBldmxpc3RlbmVyID09PSAnZnVuY3Rpb24nKVxuICAgIHJldHVybiB1bndyYXAgPyBbZXZsaXN0ZW5lci5saXN0ZW5lciB8fCBldmxpc3RlbmVyXSA6IFtldmxpc3RlbmVyXTtcblxuICByZXR1cm4gdW53cmFwID9cbiAgICB1bndyYXBMaXN0ZW5lcnMoZXZsaXN0ZW5lcikgOiBhcnJheUNsb25lKGV2bGlzdGVuZXIsIGV2bGlzdGVuZXIubGVuZ3RoKTtcbn1cblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbiBsaXN0ZW5lcnModHlwZSkge1xuICByZXR1cm4gX2xpc3RlbmVycyh0aGlzLCB0eXBlLCB0cnVlKTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmF3TGlzdGVuZXJzID0gZnVuY3Rpb24gcmF3TGlzdGVuZXJzKHR5cGUpIHtcbiAgcmV0dXJuIF9saXN0ZW5lcnModGhpcywgdHlwZSwgZmFsc2UpO1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5saXN0ZW5lckNvdW50ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgcmV0dXJuIGVtaXR0ZXIubGlzdGVuZXJDb3VudCh0eXBlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbGlzdGVuZXJDb3VudC5jYWxsKGVtaXR0ZXIsIHR5cGUpO1xuICB9XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVyQ291bnQgPSBsaXN0ZW5lckNvdW50O1xuZnVuY3Rpb24gbGlzdGVuZXJDb3VudCh0eXBlKSB7XG4gIHZhciBldmVudHMgPSB0aGlzLl9ldmVudHM7XG5cbiAgaWYgKGV2ZW50cyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgdmFyIGV2bGlzdGVuZXIgPSBldmVudHNbdHlwZV07XG5cbiAgICBpZiAodHlwZW9mIGV2bGlzdGVuZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH0gZWxzZSBpZiAoZXZsaXN0ZW5lciAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICByZXR1cm4gZXZsaXN0ZW5lci5sZW5ndGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIDA7XG59XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZXZlbnROYW1lcyA9IGZ1bmN0aW9uIGV2ZW50TmFtZXMoKSB7XG4gIHJldHVybiB0aGlzLl9ldmVudHNDb3VudCA+IDAgPyBSZWZsZWN0T3duS2V5cyh0aGlzLl9ldmVudHMpIDogW107XG59O1xuXG5mdW5jdGlvbiBhcnJheUNsb25lKGFyciwgbikge1xuICB2YXIgY29weSA9IG5ldyBBcnJheShuKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyArK2kpXG4gICAgY29weVtpXSA9IGFycltpXTtcbiAgcmV0dXJuIGNvcHk7XG59XG5cbmZ1bmN0aW9uIHNwbGljZU9uZShsaXN0LCBpbmRleCkge1xuICBmb3IgKDsgaW5kZXggKyAxIDwgbGlzdC5sZW5ndGg7IGluZGV4KyspXG4gICAgbGlzdFtpbmRleF0gPSBsaXN0W2luZGV4ICsgMV07XG4gIGxpc3QucG9wKCk7XG59XG5cbmZ1bmN0aW9uIHVud3JhcExpc3RlbmVycyhhcnIpIHtcbiAgdmFyIHJldCA9IG5ldyBBcnJheShhcnIubGVuZ3RoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXQubGVuZ3RoOyArK2kpIHtcbiAgICByZXRbaV0gPSBhcnJbaV0ubGlzdGVuZXIgfHwgYXJyW2ldO1xuICB9XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIG9uY2UoZW1pdHRlciwgbmFtZSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGZ1bmN0aW9uIGVycm9yTGlzdGVuZXIoZXJyKSB7XG4gICAgICBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyKG5hbWUsIHJlc29sdmVyKTtcbiAgICAgIHJlamVjdChlcnIpO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHJlc29sdmVyKCkge1xuICAgICAgaWYgKHR5cGVvZiBlbWl0dGVyLnJlbW92ZUxpc3RlbmVyID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGVtaXR0ZXIucmVtb3ZlTGlzdGVuZXIoJ2Vycm9yJywgZXJyb3JMaXN0ZW5lcik7XG4gICAgICB9XG4gICAgICByZXNvbHZlKFtdLnNsaWNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuICAgIGV2ZW50VGFyZ2V0QWdub3N0aWNBZGRMaXN0ZW5lcihlbWl0dGVyLCBuYW1lLCByZXNvbHZlciwgeyBvbmNlOiB0cnVlIH0pO1xuICAgIGlmIChuYW1lICE9PSAnZXJyb3InKSB7XG4gICAgICBhZGRFcnJvckhhbmRsZXJJZkV2ZW50RW1pdHRlcihlbWl0dGVyLCBlcnJvckxpc3RlbmVyLCB7IG9uY2U6IHRydWUgfSk7XG4gICAgfVxuICB9KTtcbn1cblxuZnVuY3Rpb24gYWRkRXJyb3JIYW5kbGVySWZFdmVudEVtaXR0ZXIoZW1pdHRlciwgaGFuZGxlciwgZmxhZ3MpIHtcbiAgaWYgKHR5cGVvZiBlbWl0dGVyLm9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgZXZlbnRUYXJnZXRBZ25vc3RpY0FkZExpc3RlbmVyKGVtaXR0ZXIsICdlcnJvcicsIGhhbmRsZXIsIGZsYWdzKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBldmVudFRhcmdldEFnbm9zdGljQWRkTGlzdGVuZXIoZW1pdHRlciwgbmFtZSwgbGlzdGVuZXIsIGZsYWdzKSB7XG4gIGlmICh0eXBlb2YgZW1pdHRlci5vbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIGlmIChmbGFncy5vbmNlKSB7XG4gICAgICBlbWl0dGVyLm9uY2UobmFtZSwgbGlzdGVuZXIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbWl0dGVyLm9uKG5hbWUsIGxpc3RlbmVyKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAodHlwZW9mIGVtaXR0ZXIuYWRkRXZlbnRMaXN0ZW5lciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgIC8vIEV2ZW50VGFyZ2V0IGRvZXMgbm90IGhhdmUgYGVycm9yYCBldmVudCBzZW1hbnRpY3MgbGlrZSBOb2RlXG4gICAgLy8gRXZlbnRFbWl0dGVycywgd2UgZG8gbm90IGxpc3RlbiBmb3IgYGVycm9yYCBldmVudHMgaGVyZS5cbiAgICBlbWl0dGVyLmFkZEV2ZW50TGlzdGVuZXIobmFtZSwgZnVuY3Rpb24gd3JhcExpc3RlbmVyKGFyZykge1xuICAgICAgLy8gSUUgZG9lcyBub3QgaGF2ZSBidWlsdGluIGB7IG9uY2U6IHRydWUgfWAgc3VwcG9ydCBzbyB3ZVxuICAgICAgLy8gaGF2ZSB0byBkbyBpdCBtYW51YWxseS5cbiAgICAgIGlmIChmbGFncy5vbmNlKSB7XG4gICAgICAgIGVtaXR0ZXIucmVtb3ZlRXZlbnRMaXN0ZW5lcihuYW1lLCB3cmFwTGlzdGVuZXIpO1xuICAgICAgfVxuICAgICAgbGlzdGVuZXIoYXJnKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUaGUgXCJlbWl0dGVyXCIgYXJndW1lbnQgbXVzdCBiZSBvZiB0eXBlIEV2ZW50RW1pdHRlci4gUmVjZWl2ZWQgdHlwZSAnICsgdHlwZW9mIGVtaXR0ZXIpO1xuICB9XG59XG4iLCJpbXBvcnQgeyBFdmVudEVtaXR0ZXIgfSBmcm9tICdldmVudHMnO1xuXG4vLyBBIHNtYWxsIGhlbHBlciBjbGFzcyB0aGF0IHJlZ2lzdGVycyBkcmFnJmRyb3AgZXZlbnRzIG9uIHRoZSBnaXZlblxuLy8gZWxlbWVudCBhbmQgZW1pdHMgYW4gZXZlbnQgZm9yIGV2ZXJ5IGdpZiB0aGF0IGlzIGRyb3BwZWQuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBEcm9wSGFuZGxlciBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIHByaXZhdGUgX25vZGU6IEhUTUxFbGVtZW50O1xuXG4gIGNvbnN0cnVjdG9yKGlkOiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuXG4gICAgdGhpcy5fbm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcblxuICAgIHRoaXMuX25vZGUuYWRkRXZlbnRMaXN0ZW5lcignZHJhZ292ZXInLCAoZSkgPT4gdGhpcy5oYW5kbGVEcmFnT3ZlcihlKSwgZmFsc2UpO1xuICAgIHRoaXMuX25vZGUuYWRkRXZlbnRMaXN0ZW5lcignZHJvcCcsIChlKSA9PiB0aGlzLmhhbmRsZURyb3AoZSksIGZhbHNlKTtcbiAgfVxuXG4gIHByaXZhdGUgX3ByZXZlbnREZWZhdWx0KGV2ZW50OiBEcmFnRXZlbnQpIHtcbiAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICB9XG5cbiAgaGFuZGxlRHJvcChldmVudDogRHJhZ0V2ZW50KSB7XG4gICAgdGhpcy5fcHJldmVudERlZmF1bHQoZXZlbnQpO1xuXG4gICAgQXJyYXkuZnJvbShldmVudC5kYXRhVHJhbnNmZXIuZmlsZXMpXG4gICAgICAuZmlsdGVyKChmaWxlOiBGaWxlKSA9PiBmaWxlLnR5cGUgPT09ICdpbWFnZS9naWYnKVxuICAgICAgLmZvckVhY2goKGdpZjogRmlsZSkgPT4gdGhpcy5lbWl0KCdkcm9wJywgZ2lmKSk7XG4gIH1cblxuICBoYW5kbGVEcmFnT3ZlcihldmVudDogRHJhZ0V2ZW50KSB7XG4gICAgdGhpcy5fcHJldmVudERlZmF1bHQoZXZlbnQpO1xuICB9XG59IiwiLy8gVGhlIEZpbGVSZWFkZXIgcmVhZHMgZmlsZXMgYW5kIHJldHVybnMgdGhlaXIgY29udGVudCBpblxuLy8gYSBidWZmZXIuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWxlQ29udmVydGVyIHtcblxuICAvLyBSZWFkcyB0aGUgZmlsZSBhbmQgcmV0dXJucyB0aGUgY29udGVudCBhcyBhIFVpbnQ4QXJyYXlcbiAgLy8gd3JhcHBlZCBpbnNpZGUgYSBQcm9taXNlLlxuICBzdGF0aWMgcmVhZEFzQnl0ZUFycmF5KGZpbGU6IEZpbGUpOiBQcm9taXNlPFVpbnQ4QXJyYXk+IHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgIGxldCByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuXG4gICAgICByZWFkZXIub25sb2FkID0gZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IGZpbGVSZWFkZXIgPSA8RmlsZVJlYWRlcj4gZXZlbnQudGFyZ2V0O1xuICAgICAgICBjb25zdCBidWZmZXIgPSA8QXJyYXlCdWZmZXI+IGZpbGVSZWFkZXIucmVzdWx0O1xuXG4gICAgICAgIHJlc29sdmUobmV3IFVpbnQ4QXJyYXkoYnVmZmVyKSk7XG4gICAgICB9O1xuXG4gICAgICByZWFkZXIucmVhZEFzQXJyYXlCdWZmZXIoZmlsZSk7XG4gICAgfSk7XG4gIH1cblxuICAvLyBSZWFkcyB0aGUgZmlsZSBvciBibG9iIGFuZCByZXR1cm5zIGEgc3RyaW5nIGNvbnRhaW5pbmcgYSBkYXRhXG4gIC8vIHVybCB0aGF0IGNhbiBiZSBhc3NpZ25lZCB0byBhbmQgaW1nJ3Mgc3JjIGF0dHJpYnV0ZS5cbiAgc3RhdGljIHJlYWRBc0RhdGFVcmwoZmlsZTogRmlsZSB8IEJsb2IpOiBQcm9taXNlPHN0cmluZz4ge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgY29uc3QgcmVhZGVyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgICAgcmVhZGVyLm9ubG9hZCA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICBjb25zdCBmaWxlUmVhZGVyID0gPEZpbGVSZWFkZXI+IGV2ZW50LnRhcmdldDtcbiAgICAgICAgY29uc3QgYnVmZmVyID0gPHN0cmluZz4gZmlsZVJlYWRlci5yZXN1bHQ7XG5cbiAgICAgICAgcmVzb2x2ZShidWZmZXIpO1xuICAgICAgfVxuXG4gICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICB9KVxuICB9XG5cbiAgLy8gQ29udmVydHMgYSBVaW50OEFycmF5IGludG8gYSBkYXRhIHVybCB3aXRoIHRoZSBnaXZlbiBtaW1lIHR5cGUuIERlZmF1bHRcbiAgLy8gdHlwZSBpcyBgJ2ltYWdlL2dpZidgLlxuICBzdGF0aWMgY29udmVydFRvRGF0YVVybChkYXRhOiBVaW50OEFycmF5LCB0eXBlOiBzdHJpbmcgPSAnaW1hZ2UvZ2lmJyk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgY29uc3QgYmxvYiA9IG5ldyBCbG9iKFtkYXRhXSwge3R5cGV9KTtcbiAgICByZXR1cm4gdGhpcy5yZWFkQXNEYXRhVXJsKGJsb2IpO1xuICB9XG59IiwiZXhwb3J0IGNsYXNzIEdpZkRpc3BsYXkge1xuICBwcml2YXRlIF9yb290OiBIVE1MRWxlbWVudDtcbiAgcHJpdmF0ZSBfY29udGFpbmVyOiBIVE1MRGl2RWxlbWVudDtcbiAgcHJpdmF0ZSBfcHJvZ3Jlc3M6IEhUTUxQcm9ncmVzc0VsZW1lbnQ7XG5cbiAgY29uc3RydWN0b3IocHVibGljIG5hbWU6IHN0cmluZywgcm9vdDogc3RyaW5nKSB7XG4gICAgdGhpcy5fcm9vdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHJvb3QpO1xuXG4gICAgdGhpcy5fcHJvZ3Jlc3MgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwcm9ncmVzcycpO1xuICAgIHRoaXMuX3Byb2dyZXNzLmNsYXNzTGlzdC5hZGQoJ2dpZi1wcm9ncmVzcycpO1xuXG4gICAgY29uc3QgdGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpLFxuICAgICAgdGl0bGVUZXh0ID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobmFtZSk7XG4gICAgdGl0bGUuYXBwZW5kQ2hpbGQodGl0bGVUZXh0KTtcblxuICAgIHRoaXMuX2NvbnRhaW5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX2NvbnRhaW5lci5jbGFzc0xpc3QuYWRkKCdzaW5nbGUtcmVzdWx0Jyk7XG4gICAgdGhpcy5fY29udGFpbmVyLmFwcGVuZENoaWxkKHRpdGxlKTtcbiAgICB0aGlzLl9jb250YWluZXIuYXBwZW5kQ2hpbGQodGhpcy5fcHJvZ3Jlc3MpO1xuXG4gICAgaWYgKHRoaXMuX3Jvb3QuY2hpbGROb2Rlcy5sZW5ndGggPiAwKSB7XG4gICAgICB0aGlzLl9yb290Lmluc2VydEJlZm9yZSh0aGlzLl9jb250YWluZXIsIHRoaXMuX3Jvb3QuY2hpbGROb2Rlc1swXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuX3Jvb3QuYXBwZW5kQ2hpbGQodGhpcy5fY29udGFpbmVyKTtcbiAgICB9XG4gIH1cblxuICBwdWJsaWMgdXBkYXRlUHJvZ3Jlc3MoY3VycmVudDogbnVtYmVyLCBtYXg6IG51bWJlcikge1xuICAgIHRoaXMuX3Byb2dyZXNzLm1heCA9IG1heDtcbiAgICB0aGlzLl9wcm9ncmVzcy52YWx1ZSA9IGN1cnJlbnQ7XG4gIH1cblxuICBwcml2YXRlIF9jcmVhdGVJbWFnZShzcmM6IHN0cmluZywgZmlsZW5hbWU6IHN0cmluZyk6IEhUTUxBbmNob3JFbGVtZW50IHtcbiAgICBjb25zdCBpbWFnZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2ltZycpO1xuICAgIGltYWdlLnNyYyA9IHNyYztcblxuICAgIGNvbnN0IGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdhJyk7XG4gICAgbGluay5ocmVmID0gc3JjO1xuICAgIGxpbmsuZG93bmxvYWQgPSBmaWxlbmFtZTtcbiAgICBsaW5rLmFwcGVuZENoaWxkKGltYWdlKTtcblxuICAgIHJldHVybiBsaW5rO1xuICB9XG5cbiAgcHVibGljIHNob3dHaWZzKGZpbGVuYW1lOiBzdHJpbmcsIG9yaWdpbmFsOiBzdHJpbmcsIHJldmVyc2VkOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9jb250YWluZXIucmVtb3ZlQ2hpbGQodGhpcy5fcHJvZ3Jlc3MpO1xuXG4gICAgY29uc3Qgb3JpZ2luYWxHaWYgPSB0aGlzLl9jcmVhdGVJbWFnZShvcmlnaW5hbCwgZmlsZW5hbWUpLFxuICAgICAgcmV2ZXJzZWRHaWYgPSB0aGlzLl9jcmVhdGVJbWFnZShyZXZlcnNlZCwgYCR7ZmlsZW5hbWV9LXJldmVyc2VkLmdpZmApO1xuXG4gICAgdGhpcy5fY29udGFpbmVyLmFwcGVuZENoaWxkKG9yaWdpbmFsR2lmKTtcbiAgICB0aGlzLl9jb250YWluZXIuYXBwZW5kQ2hpbGQocmV2ZXJzZWRHaWYpO1xuICB9XG5cbiAgcHVibGljIHNob3dFcnJvcihtZXNzYWdlOiBzdHJpbmcsIHN0YWNrOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9jb250YWluZXIucmVtb3ZlQ2hpbGQodGhpcy5fcHJvZ3Jlc3MpO1xuICAgIGNvbnN0IGVycm9yRGlzcGxheSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG4gICAgZXJyb3JEaXNwbGF5LmlubmVySFRNTCA9IGBcbiAgICA8ZGl2IGNsYXNzPVwiZXJyb3JcIj5cbiAgICAgIEl0IHNlZW1zIGxpa2UgSSBjYW4ndCByZXZlcnNlIHRoYXQgZ2lmLiBIZXJlIGFyZSBzb21lIGRldGFpbHMgaWYgeW91IHdhbnQgdG9cbiAgICAgIDxhIGNsYXNzPVwiZXJyb3JcIiBocmVmPVwiaHR0cHM6Ly9naXRodWIuY29tL21pZ2VyaC9ydXN0d2FzbS1naWYvaXNzdWVzL25ld1wiPmZpbGUgYW4gaXNzdWU8L2E+OlxuICAgIDwvZGl2PlxuICAgIDxkaXYgY2xhc3M9XCJlcnJvclwiPlxuICAgICAgJHttZXNzYWdlfVxuICAgIDwvZGl2PlxuICAgIDxkaXY+XG4gICAgICAke3N0YWNrLnJlcGxhY2UoL1xcbi9nLCAnPGJyIC8+Jyl9XG4gICAgPC9kaXY+YDtcblxuICAgIHRoaXMuX2NvbnRhaW5lci5hcHBlbmRDaGlsZChlcnJvckRpc3BsYXkpO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEdpZkRpc3BsYXk7IiwiaW1wb3J0IHsgdjQgfSBmcm9tICd1dWlkJztcbmltcG9ydCB7IEV2ZW50RW1pdHRlciB9IGZyb20gJ2V2ZW50cyc7XG5cbmltcG9ydCBGaWxlQ29udmVydGVyIGZyb20gJy4vZmlsZUNvbnZlcnRlcic7XG5cbmV4cG9ydCBjbGFzcyBHaWZSZXZlcnNlciB7XG4gIHByaXZhdGUgX2pvYnM6IEdpZlJldmVyc2FsSm9iW107XG4gIHByaXZhdGUgX2pvYnNXYWl0aW5nRm9yV29ya2VyOiBHaWZSZXZlcnNhbEpvYltdO1xuICBwcml2YXRlIF9udW1iZXJPZldvcmtlcnM6IG51bWJlciA9IG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5IHx8IDI7XG4gIHByaXZhdGUgX3dvcmtlcnM6IFdvcmtlcltdO1xuICBwcml2YXRlIF9hdmFpbGFibGVXb3JrZXJzOiBXb3JrZXJbXTtcbiAgcHJpdmF0ZSBfYnVzeVdvcmtlcnM6IFdvcmtlcltdO1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuX2pvYnMgPSBbXTtcbiAgICB0aGlzLl9qb2JzV2FpdGluZ0ZvcldvcmtlciA9IFtdO1xuXG4gICAgdGhpcy5fd29ya2VycyA9IEFycmF5LmZyb20oQXJyYXkodGhpcy5fbnVtYmVyT2ZXb3JrZXJzKS5rZXlzKCkpLm1hcCgoKSA9PiBuZXcgV29ya2VyKG5ldyBVUkwoJy4vcHJvY2Vzc2luZy53b3JrZXInLCBpbXBvcnQubWV0YS51cmwpKSk7XG4gICAgdGhpcy5fd29ya2Vycy5mb3JFYWNoKHcgPT4gdy5vbm1lc3NhZ2UgPSB0aGlzLl9oYW5kbGVNZXNzYWdlLmJpbmQodGhpcykpO1xuICAgIHRoaXMuX3dvcmtlcnMuZm9yRWFjaCh3ID0+IHcub25lcnJvciA9IHRoaXMuX2hhbmRsZUVycm9yLmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5fYXZhaWxhYmxlV29ya2VycyA9IFsuLi50aGlzLl93b3JrZXJzXTtcbiAgICB0aGlzLl9idXN5V29ya2VycyA9IFtdO1xuICB9XG5cbiAgcHJpdmF0ZSBfZmluZEpvYkJ5SWQoaWQ6IHN0cmluZyk6IEdpZlJldmVyc2FsSm9iIHtcbiAgICByZXR1cm4gdGhpcy5fam9icy5maW5kKGogPT4gai5pZCA9PT0gaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfcmVtb3ZlSm9iQnlJZChpZDogc3RyaW5nKSB7XG4gICAgdGhpcy5fam9icyA9IHRoaXMuX2pvYnMuZmlsdGVyKGogPT4gai5pZCAhPT0gaWQpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZ2V0TmV4dFdvcmtlcigpOiBXb3JrZXIge1xuICAgIGNvbnN0IHdvcmtlciA9IHRoaXMuX2F2YWlsYWJsZVdvcmtlcnMucG9wKCk7XG4gICAgdGhpcy5fYnVzeVdvcmtlcnMucHVzaCh3b3JrZXIpO1xuXG4gICAgcmV0dXJuIHdvcmtlcjtcbiAgfVxuXG4gIHByaXZhdGUgX2dldE5leHRKb2IoKTogR2lmUmV2ZXJzYWxKb2Ige1xuICAgIGNvbnN0IGpvYiA9IHRoaXMuX2pvYnNXYWl0aW5nRm9yV29ya2VyLnNoaWZ0KCk7XG4gICAgdGhpcy5fam9icy5wdXNoKGpvYik7XG5cbiAgICByZXR1cm4gam9iO1xuICB9XG5cbiAgcHJpdmF0ZSBfbWFrZVdvcmtlckF2YWlsYWJsZSh3b3JrZXI6IFdvcmtlcikge1xuICAgIHRoaXMuX2J1c3lXb3JrZXJzID0gdGhpcy5fYnVzeVdvcmtlcnMuZmlsdGVyKHcgPT4gdyAhPT0gd29ya2VyKTtcbiAgICB0aGlzLl9hdmFpbGFibGVXb3JrZXJzLnB1c2god29ya2VyKTtcbiAgfVxuXG4gIHByaXZhdGUgX2Fzc2lnbkpvYlRvV29ya2VyKGpvYjogR2lmUmV2ZXJzYWxKb2IsIHdvcmtlcjogV29ya2VyKSB7XG4gICAgd29ya2VyLnBvc3RNZXNzYWdlKGpvYi5nZXRNZXNzYWdlRm9yV29ya2VyKCkpO1xuICB9XG5cbiAgcHJpdmF0ZSBfZGlzdHJpYnV0ZUpvYnMoKSB7XG4gICAgY29uc3QgbnVtYmVyT2ZBdmFpbGFibGVXb3JrZXJzID0gdGhpcy5fYXZhaWxhYmxlV29ya2Vycy5sZW5ndGgsXG4gICAgICBudW1iZXJPZldhaXRpbmdKb2JzID0gdGhpcy5fam9ic1dhaXRpbmdGb3JXb3JrZXIubGVuZ3RoLFxuICAgICAgam9ic1RvRGlzdHJpYnV0ZSA9IE1hdGgubWluKG51bWJlck9mQXZhaWxhYmxlV29ya2VycywgbnVtYmVyT2ZXYWl0aW5nSm9icyk7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGpvYnNUb0Rpc3RyaWJ1dGU7ICsraSkge1xuICAgICAgdGhpcy5fYXNzaWduSm9iVG9Xb3JrZXIodGhpcy5fZ2V0TmV4dEpvYigpLCB0aGlzLl9nZXROZXh0V29ya2VyKCkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX2hhbmRsZU1lc3NhZ2UoZXZlbnQ6IE1lc3NhZ2VFdmVudCkge1xuICAgIGNvbnN0IGRhdGEgPSA8TWVzc2FnZUV2ZW50RGF0YT5ldmVudC5kYXRhLFxuICAgICAgaWQgPSBkYXRhLmlkLFxuICAgICAgam9iID0gdGhpcy5fZmluZEpvYkJ5SWQoaWQpO1xuXG4gICAgc3dpdGNoIChkYXRhLnR5cGUpIHtcbiAgICAgIGNhc2UgJ3JlZ2lzdGVyX3Byb2dyZXNzJzpcbiAgICAgICAgam9iLm51bWJlck9mRnJhbWVzID0gZGF0YS5udW1iZXJPZkZyYW1lcztcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdyZXBvcnRfcHJvZ3Jlc3MnOlxuICAgICAgICBqb2IuZW1pdCgncHJvZ3Jlc3MnLCA8UHJvZ3Jlc3NFdmVudD57IC4uLmRhdGEsIG51bWJlck9mRnJhbWVzOiBqb2IubnVtYmVyT2ZGcmFtZXMgfSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnZmluaXNoZWQnOlxuICAgICAgICB0aGlzLl9yZW1vdmVKb2JCeUlkKGlkKTtcbiAgICAgICAgdGhpcy5fbWFrZVdvcmtlckF2YWlsYWJsZSg8V29ya2VyPmV2ZW50LnRhcmdldCk7XG4gICAgICAgIHRoaXMuX2Rpc3RyaWJ1dGVKb2JzKCk7XG4gICAgICAgIGpvYi5lbWl0KCdmaW5pc2hlZCcsIDxSZXZlcnNlZEdpZj5kYXRhKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICdlcnJvcic6XG4gICAgICAgIHRoaXMuX3JlbW92ZUpvYkJ5SWQoaWQpO1xuICAgICAgICB0aGlzLl9tYWtlV29ya2VyQXZhaWxhYmxlKDxXb3JrZXI+ZXZlbnQudGFyZ2V0KTtcbiAgICAgICAgdGhpcy5fZGlzdHJpYnV0ZUpvYnMoKTtcbiAgICAgICAgam9iLmVtaXQoJ2Vycm9yJywgPFByb2Nlc3NpbmdFcnJvckV2ZW50PmRhdGEpO1xuICAgIH1cbiAgfVxuXG4gIC8vIHRvZG86IHJvdXRlIGVycm9ycyB0byB0aGUgcmlnaHQgam9iXG4gIHByaXZhdGUgX2hhbmRsZUVycm9yKGV2ZW50OiBFcnJvckV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBjb25zb2xlLmVycm9yKCdBbiBlcnJvciBvY2N1cnJlZCBpbml0aWFsaXppbmcgdGhlIHdvcmtlcjonLCBldmVudC5tZXNzYWdlLCBldmVudC5lcnJvcik7XG4gIH1cblxuICBhc3luYyBwcm9jZXNzKGZpbGU6IEZpbGUpOiBQcm9taXNlPEdpZlJldmVyc2FsSm9iPiB7XG4gICAgY29uc3QgYnVmZmVyID0gYXdhaXQgRmlsZUNvbnZlcnRlci5yZWFkQXNCeXRlQXJyYXkoZmlsZSksXG4gICAgICB7IG5hbWUgfSA9IGZpbGUsXG4gICAgICBpZCA9IHY0KCksXG4gICAgICBqb2IgPSBuZXcgR2lmUmV2ZXJzYWxKb2IoaWQsIG5hbWUsIGJ1ZmZlcik7XG5cbiAgICB0aGlzLl9qb2JzV2FpdGluZ0Zvcldvcmtlci5wdXNoKGpvYik7XG4gICAgdGhpcy5fZGlzdHJpYnV0ZUpvYnMoKTtcblxuICAgIHJldHVybiBqb2I7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2lmUmV2ZXJzZXI7XG5cbmV4cG9ydCBjbGFzcyBHaWZSZXZlcnNhbEpvYiBleHRlbmRzIEV2ZW50RW1pdHRlciB7XG4gIHB1YmxpYyBudW1iZXJPZkZyYW1lczogbnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyBpZDogc3RyaW5nLCBwdWJsaWMgbmFtZTogc3RyaW5nLCBwdWJsaWMgYnVmZmVyOiBVaW50OEFycmF5KSB7XG4gICAgc3VwZXIoKTtcbiAgfVxuXG4gIHB1YmxpYyBnZXRNZXNzYWdlRm9yV29ya2VyKCkge1xuICAgIGNvbnN0IHtpZCwgbmFtZSwgYnVmZmVyfSA9IHRoaXM7XG4gICAgcmV0dXJuIHtpZCwgbmFtZSwgYnVmZmVyfTtcbiAgfVxufVxuXG50eXBlIFJlZ2lzdGVyUHJvZ3Jlc3NFdmVudERhdGEgPSB7XG4gIHR5cGU6ICdyZWdpc3Rlcl9wcm9ncmVzcyc7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgbnVtYmVyT2ZGcmFtZXM6IG51bWJlcjtcbn1cblxudHlwZSBSZXBvcnRQcm9ncmVzc0V2ZW50RGF0YSA9IHtcbiAgdHlwZTogJ3JlcG9ydF9wcm9ncmVzcyc7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgY3VycmVudEZyYW1lOiBudW1iZXI7XG59XG5cbnR5cGUgRmluaXNoZWRFdmVudERhdGEgPSB7XG4gIHR5cGU6ICdmaW5pc2hlZCc7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgYnVmZmVyOiBVaW50OEFycmF5O1xuICByZXZlcnNlZEJ1ZmZlcjogVWludDhBcnJheTtcbn1cblxudHlwZSBFcnJvckV2ZW50RGF0YSA9IHtcbiAgdHlwZTogJ2Vycm9yJyxcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHN0YWNrOiBzdHJpbmc7XG59XG5cbnR5cGUgTWVzc2FnZUV2ZW50RGF0YSA9IFJlZ2lzdGVyUHJvZ3Jlc3NFdmVudERhdGEgfCBSZXBvcnRQcm9ncmVzc0V2ZW50RGF0YSB8IEZpbmlzaGVkRXZlbnREYXRhIHwgRXJyb3JFdmVudERhdGE7XG5cbmV4cG9ydCBjbGFzcyBQcm9ncmVzc0V2ZW50IHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBjdXJyZW50RnJhbWU6IG51bWJlcjtcbiAgbnVtYmVyT2ZGcmFtZXM6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIFByb2Nlc3NpbmdFcnJvckV2ZW50IHtcbiAgaWQ6IHN0cmluZztcbiAgbmFtZTogc3RyaW5nO1xuICBtZXNzYWdlOiBzdHJpbmc7XG4gIHN0YWNrOiBzdHJpbmc7XG59XG5cbmV4cG9ydCBjbGFzcyBSZXZlcnNlZEdpZiB7XG4gIGlkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgYnVmZmVyOiBVaW50OEFycmF5O1xuICByZXZlcnNlZEJ1ZmZlcjogVWludDhBcnJheTtcbn0iLCJjb25zdCByYW5kb21VVUlEID0gdHlwZW9mIGNyeXB0byAhPT0gJ3VuZGVmaW5lZCcgJiYgY3J5cHRvLnJhbmRvbVVVSUQgJiYgY3J5cHRvLnJhbmRvbVVVSUQuYmluZChjcnlwdG8pO1xuZXhwb3J0IGRlZmF1bHQge1xuICByYW5kb21VVUlEXG59OyIsImV4cG9ydCBkZWZhdWx0IC9eKD86WzAtOWEtZl17OH0tWzAtOWEtZl17NH0tWzEtNV1bMC05YS1mXXszfS1bODlhYl1bMC05YS1mXXszfS1bMC05YS1mXXsxMn18MDAwMDAwMDAtMDAwMC0wMDAwLTAwMDAtMDAwMDAwMDAwMDAwKSQvaTsiLCIvLyBVbmlxdWUgSUQgY3JlYXRpb24gcmVxdWlyZXMgYSBoaWdoIHF1YWxpdHkgcmFuZG9tICMgZ2VuZXJhdG9yLiBJbiB0aGUgYnJvd3NlciB3ZSB0aGVyZWZvcmVcbi8vIHJlcXVpcmUgdGhlIGNyeXB0byBBUEkgYW5kIGRvIG5vdCBzdXBwb3J0IGJ1aWx0LWluIGZhbGxiYWNrIHRvIGxvd2VyIHF1YWxpdHkgcmFuZG9tIG51bWJlclxuLy8gZ2VuZXJhdG9ycyAobGlrZSBNYXRoLnJhbmRvbSgpKS5cbmxldCBnZXRSYW5kb21WYWx1ZXM7XG5jb25zdCBybmRzOCA9IG5ldyBVaW50OEFycmF5KDE2KTtcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIHJuZygpIHtcbiAgLy8gbGF6eSBsb2FkIHNvIHRoYXQgZW52aXJvbm1lbnRzIHRoYXQgbmVlZCB0byBwb2x5ZmlsbCBoYXZlIGEgY2hhbmNlIHRvIGRvIHNvXG4gIGlmICghZ2V0UmFuZG9tVmFsdWVzKSB7XG4gICAgLy8gZ2V0UmFuZG9tVmFsdWVzIG5lZWRzIHRvIGJlIGludm9rZWQgaW4gYSBjb250ZXh0IHdoZXJlIFwidGhpc1wiIGlzIGEgQ3J5cHRvIGltcGxlbWVudGF0aW9uLlxuICAgIGdldFJhbmRvbVZhbHVlcyA9IHR5cGVvZiBjcnlwdG8gIT09ICd1bmRlZmluZWQnICYmIGNyeXB0by5nZXRSYW5kb21WYWx1ZXMgJiYgY3J5cHRvLmdldFJhbmRvbVZhbHVlcy5iaW5kKGNyeXB0byk7XG5cbiAgICBpZiAoIWdldFJhbmRvbVZhbHVlcykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdjcnlwdG8uZ2V0UmFuZG9tVmFsdWVzKCkgbm90IHN1cHBvcnRlZC4gU2VlIGh0dHBzOi8vZ2l0aHViLmNvbS91dWlkanMvdXVpZCNnZXRyYW5kb212YWx1ZXMtbm90LXN1cHBvcnRlZCcpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBnZXRSYW5kb21WYWx1ZXMocm5kczgpO1xufSIsImltcG9ydCB2YWxpZGF0ZSBmcm9tICcuL3ZhbGlkYXRlLmpzJztcbi8qKlxuICogQ29udmVydCBhcnJheSBvZiAxNiBieXRlIHZhbHVlcyB0byBVVUlEIHN0cmluZyBmb3JtYXQgb2YgdGhlIGZvcm06XG4gKiBYWFhYWFhYWC1YWFhYLVhYWFgtWFhYWC1YWFhYWFhYWFhYWFhcbiAqL1xuXG5jb25zdCBieXRlVG9IZXggPSBbXTtcblxuZm9yIChsZXQgaSA9IDA7IGkgPCAyNTY7ICsraSkge1xuICBieXRlVG9IZXgucHVzaCgoaSArIDB4MTAwKS50b1N0cmluZygxNikuc2xpY2UoMSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdW5zYWZlU3RyaW5naWZ5KGFyciwgb2Zmc2V0ID0gMCkge1xuICAvLyBOb3RlOiBCZSBjYXJlZnVsIGVkaXRpbmcgdGhpcyBjb2RlISAgSXQncyBiZWVuIHR1bmVkIGZvciBwZXJmb3JtYW5jZVxuICAvLyBhbmQgd29ya3MgaW4gd2F5cyB5b3UgbWF5IG5vdCBleHBlY3QuIFNlZSBodHRwczovL2dpdGh1Yi5jb20vdXVpZGpzL3V1aWQvcHVsbC80MzRcbiAgcmV0dXJuIChieXRlVG9IZXhbYXJyW29mZnNldCArIDBdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMV1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyAyXV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDNdXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgNF1dICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA1XV0gKyAnLScgKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDZdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgN11dICsgJy0nICsgYnl0ZVRvSGV4W2FycltvZmZzZXQgKyA4XV0gKyBieXRlVG9IZXhbYXJyW29mZnNldCArIDldXSArICctJyArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTBdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTFdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTJdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTNdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTRdXSArIGJ5dGVUb0hleFthcnJbb2Zmc2V0ICsgMTVdXSkudG9Mb3dlckNhc2UoKTtcbn1cblxuZnVuY3Rpb24gc3RyaW5naWZ5KGFyciwgb2Zmc2V0ID0gMCkge1xuICBjb25zdCB1dWlkID0gdW5zYWZlU3RyaW5naWZ5KGFyciwgb2Zmc2V0KTsgLy8gQ29uc2lzdGVuY3kgY2hlY2sgZm9yIHZhbGlkIFVVSUQuICBJZiB0aGlzIHRocm93cywgaXQncyBsaWtlbHkgZHVlIHRvIG9uZVxuICAvLyBvZiB0aGUgZm9sbG93aW5nOlxuICAvLyAtIE9uZSBvciBtb3JlIGlucHV0IGFycmF5IHZhbHVlcyBkb24ndCBtYXAgdG8gYSBoZXggb2N0ZXQgKGxlYWRpbmcgdG9cbiAgLy8gXCJ1bmRlZmluZWRcIiBpbiB0aGUgdXVpZClcbiAgLy8gLSBJbnZhbGlkIGlucHV0IHZhbHVlcyBmb3IgdGhlIFJGQyBgdmVyc2lvbmAgb3IgYHZhcmlhbnRgIGZpZWxkc1xuXG4gIGlmICghdmFsaWRhdGUodXVpZCkpIHtcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ1N0cmluZ2lmaWVkIFVVSUQgaXMgaW52YWxpZCcpO1xuICB9XG5cbiAgcmV0dXJuIHV1aWQ7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHN0cmluZ2lmeTsiLCJpbXBvcnQgbmF0aXZlIGZyb20gJy4vbmF0aXZlLmpzJztcbmltcG9ydCBybmcgZnJvbSAnLi9ybmcuanMnO1xuaW1wb3J0IHsgdW5zYWZlU3RyaW5naWZ5IH0gZnJvbSAnLi9zdHJpbmdpZnkuanMnO1xuXG5mdW5jdGlvbiB2NChvcHRpb25zLCBidWYsIG9mZnNldCkge1xuICBpZiAobmF0aXZlLnJhbmRvbVVVSUQgJiYgIWJ1ZiAmJiAhb3B0aW9ucykge1xuICAgIHJldHVybiBuYXRpdmUucmFuZG9tVVVJRCgpO1xuICB9XG5cbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIGNvbnN0IHJuZHMgPSBvcHRpb25zLnJhbmRvbSB8fCAob3B0aW9ucy5ybmcgfHwgcm5nKSgpOyAvLyBQZXIgNC40LCBzZXQgYml0cyBmb3IgdmVyc2lvbiBhbmQgYGNsb2NrX3NlcV9oaV9hbmRfcmVzZXJ2ZWRgXG5cbiAgcm5kc1s2XSA9IHJuZHNbNl0gJiAweDBmIHwgMHg0MDtcbiAgcm5kc1s4XSA9IHJuZHNbOF0gJiAweDNmIHwgMHg4MDsgLy8gQ29weSBieXRlcyB0byBidWZmZXIsIGlmIHByb3ZpZGVkXG5cbiAgaWYgKGJ1Zikge1xuICAgIG9mZnNldCA9IG9mZnNldCB8fCAwO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCAxNjsgKytpKSB7XG4gICAgICBidWZbb2Zmc2V0ICsgaV0gPSBybmRzW2ldO1xuICAgIH1cblxuICAgIHJldHVybiBidWY7XG4gIH1cblxuICByZXR1cm4gdW5zYWZlU3RyaW5naWZ5KHJuZHMpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2NDsiLCJpbXBvcnQgUkVHRVggZnJvbSAnLi9yZWdleC5qcyc7XG5cbmZ1bmN0aW9uIHZhbGlkYXRlKHV1aWQpIHtcbiAgcmV0dXJuIHR5cGVvZiB1dWlkID09PSAnc3RyaW5nJyAmJiBSRUdFWC50ZXN0KHV1aWQpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB2YWxpZGF0ZTsiLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuLy8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbl9fd2VicGFja19yZXF1aXJlX18ubSA9IF9fd2VicGFja19tb2R1bGVzX187XG5cbiIsIi8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSAobW9kdWxlKSA9PiB7XG5cdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuXHRcdCgpID0+IChtb2R1bGVbJ2RlZmF1bHQnXSkgOlxuXHRcdCgpID0+IChtb2R1bGUpO1xuXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCB7IGE6IGdldHRlciB9KTtcblx0cmV0dXJuIGdldHRlcjtcbn07IiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiLy8gVGhpcyBmdW5jdGlvbiBhbGxvdyB0byByZWZlcmVuY2UgYXN5bmMgY2h1bmtzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnUgPSAoY2h1bmtJZCkgPT4ge1xuXHQvLyByZXR1cm4gdXJsIGZvciBmaWxlbmFtZXMgYmFzZWQgb24gdGVtcGxhdGVcblx0cmV0dXJuIFwiXCIgKyBjaHVua0lkICsgXCIubWFpbi5qc1wiO1xufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJ2YXIgc2NyaXB0VXJsO1xuaWYgKF9fd2VicGFja19yZXF1aXJlX18uZy5pbXBvcnRTY3JpcHRzKSBzY3JpcHRVcmwgPSBfX3dlYnBhY2tfcmVxdWlyZV9fLmcubG9jYXRpb24gKyBcIlwiO1xudmFyIGRvY3VtZW50ID0gX193ZWJwYWNrX3JlcXVpcmVfXy5nLmRvY3VtZW50O1xuaWYgKCFzY3JpcHRVcmwgJiYgZG9jdW1lbnQpIHtcblx0aWYgKGRvY3VtZW50LmN1cnJlbnRTY3JpcHQpXG5cdFx0c2NyaXB0VXJsID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmNcblx0aWYgKCFzY3JpcHRVcmwpIHtcblx0XHR2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwic2NyaXB0XCIpO1xuXHRcdGlmKHNjcmlwdHMubGVuZ3RoKSBzY3JpcHRVcmwgPSBzY3JpcHRzW3NjcmlwdHMubGVuZ3RoIC0gMV0uc3JjXG5cdH1cbn1cbi8vIFdoZW4gc3VwcG9ydGluZyBicm93c2VycyB3aGVyZSBhbiBhdXRvbWF0aWMgcHVibGljUGF0aCBpcyBub3Qgc3VwcG9ydGVkIHlvdSBtdXN0IHNwZWNpZnkgYW4gb3V0cHV0LnB1YmxpY1BhdGggbWFudWFsbHkgdmlhIGNvbmZpZ3VyYXRpb25cbi8vIG9yIHBhc3MgYW4gZW1wdHkgc3RyaW5nIChcIlwiKSBhbmQgc2V0IHRoZSBfX3dlYnBhY2tfcHVibGljX3BhdGhfXyB2YXJpYWJsZSBmcm9tIHlvdXIgY29kZSB0byB1c2UgeW91ciBvd24gbG9naWMuXG5pZiAoIXNjcmlwdFVybCkgdGhyb3cgbmV3IEVycm9yKFwiQXV0b21hdGljIHB1YmxpY1BhdGggaXMgbm90IHN1cHBvcnRlZCBpbiB0aGlzIGJyb3dzZXJcIik7XG5zY3JpcHRVcmwgPSBzY3JpcHRVcmwucmVwbGFjZSgvIy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcPy4qJC8sIFwiXCIpLnJlcGxhY2UoL1xcL1teXFwvXSskLywgXCIvXCIpO1xuX193ZWJwYWNrX3JlcXVpcmVfXy5wID0gc2NyaXB0VXJsOyIsIl9fd2VicGFja19yZXF1aXJlX18uYiA9IGRvY3VtZW50LmJhc2VVUkkgfHwgc2VsZi5sb2NhdGlvbi5ocmVmO1xuXG4vLyBvYmplY3QgdG8gc3RvcmUgbG9hZGVkIGFuZCBsb2FkaW5nIGNodW5rc1xuLy8gdW5kZWZpbmVkID0gY2h1bmsgbm90IGxvYWRlZCwgbnVsbCA9IGNodW5rIHByZWxvYWRlZC9wcmVmZXRjaGVkXG4vLyBbcmVzb2x2ZSwgcmVqZWN0LCBQcm9taXNlXSA9IGNodW5rIGxvYWRpbmcsIDAgPSBjaHVuayBsb2FkZWRcbnZhciBpbnN0YWxsZWRDaHVua3MgPSB7XG5cdFwibWFpblwiOiAwXG59O1xuXG4vLyBubyBjaHVuayBvbiBkZW1hbmQgbG9hZGluZ1xuXG4vLyBubyBwcmVmZXRjaGluZ1xuXG4vLyBubyBwcmVsb2FkZWRcblxuLy8gbm8gSE1SXG5cbi8vIG5vIEhNUiBtYW5pZmVzdFxuXG4vLyBubyBvbiBjaHVua3MgbG9hZGVkXG5cbi8vIG5vIGpzb25wIGZ1bmN0aW9uIiwiaW1wb3J0IERyb3BIYW5kbGVyIGZyb20gJy4vZHJvcEhhbmRsZXInO1xuaW1wb3J0IHtHaWZSZXZlcnNlciwgUmV2ZXJzZWRHaWYsIFByb2dyZXNzRXZlbnQsIFByb2Nlc3NpbmdFcnJvckV2ZW50fSBmcm9tICcuL2dpZlJldmVyc2VyJztcbmltcG9ydCBGaWxlQ29udmVydGVyIGZyb20gJy4vZmlsZUNvbnZlcnRlcic7XG5pbXBvcnQgeyBHaWZEaXNwbGF5IH0gZnJvbSAnLi9naWZEaXNwbGF5JztcblxuLy8gVGhpcyBnbHVlcyBldmVyeXRoaW5nIHRvZ2V0aGVyLiBUaGUgRHJvcGhhbmRsZXIgbGlzdGVucyBmb3IgZHJvcCBldmVudHMgb25cbi8vIHRoZSBkcm9wIGh0bWwgZWxlbWVudC4gT25jZSBhIGdpZiBkcm9wcyBpdCB3aWxsIGJlIHBhc3NlZCBvdmVyIHRvIHRoZVxuLy8gZ2lmIHByb2Nlc3Nvci4gT25jZSB0aGUgZ2lmIHByb2Nlc3NvciBpcyBmaW5pc2hlZCByZXZlcnNpbmcgdGhlIGdpZiB3ZVxuLy8gZGlzcGxheSBpdC4gVG8gZW5zdXJlIHRoYXQgZXZlcnl0aGluZyBpcyBwcm9wZXJseSBpbml0aWFsaXplZCwgd2Ugc2V0XG4vLyBldmVyeXRoaW5nIHVwIGJhY2t3YXJkcy5cblxuLy8gRmlyc3Qgd2UgaW5pdGlhbGl6ZSB0aGUgZ2lmIHByb2Nlc3NvciBhbmTigKZcbmNvbnN0IGdpZlByb2Nlc3NvciA9IG5ldyBHaWZSZXZlcnNlcigpLFxuICByb290Tm9kZUlkID0gJ3Jlc3VsdENvbnRhaW5lcic7XG5cbi8vIOKApmRlZmluZSB3aGF0IGhhcHBlbnMgd2hlbiBhIGpvYiBpcyBmaW5pc2hlZC5cbmNvbnN0IGNyZWF0ZUpvYkZpbmlzaGVkSGFuZGxlciA9IChkaXNwbGF5OiBHaWZEaXNwbGF5KSA9PiBhc3luYyBmdW5jdGlvbihkYXRhOiBSZXZlcnNlZEdpZikge1xuICBjb25zdCB7bmFtZSwgYnVmZmVyLCByZXZlcnNlZEJ1ZmZlcn0gPSBkYXRhO1xuICBjb25zdCBvcmlnaW5hbEdpZkRhdGEgPSBhd2FpdCBGaWxlQ29udmVydGVyLmNvbnZlcnRUb0RhdGFVcmwoYnVmZmVyKTtcbiAgY29uc3QgcmV2ZXJzZWRHaWZEYXRhID0gYXdhaXQgRmlsZUNvbnZlcnRlci5jb252ZXJ0VG9EYXRhVXJsKHJldmVyc2VkQnVmZmVyKTtcblxuICBkaXNwbGF5LnNob3dHaWZzKG5hbWUsIG9yaWdpbmFsR2lmRGF0YSwgcmV2ZXJzZWRHaWZEYXRhKTtcbn07XG5cbi8vIFRoZW4gd2UgZGVmaW5lIHdoYXQgaGFwcGVucyBvbiBhIHByb2dyZXNzIGV2ZW50LlxuY29uc3QgY3JlYXRlSm9iUHJvZ3Jlc3NIYW5kbGVyID0gKGRpc3BsYXk6IEdpZkRpc3BsYXkpID0+IChpdGVtOiBQcm9ncmVzc0V2ZW50KSA9PiB7XG4gIGRpc3BsYXkudXBkYXRlUHJvZ3Jlc3MoaXRlbS5jdXJyZW50RnJhbWUsIGl0ZW0ubnVtYmVyT2ZGcmFtZXMpO1xufTtcblxuY29uc3QgY3JlYXRlRXJyb3JIYW5kbGVyID0gKGRpc3BsYXk6IEdpZkRpc3BsYXkpID0+IChldmVudDogUHJvY2Vzc2luZ0Vycm9yRXZlbnQpID0+IHtcbiAgY29uc3Qge21lc3NhZ2UsIHN0YWNrfSA9IGV2ZW50O1xuICBkaXNwbGF5LnNob3dFcnJvcihtZXNzYWdlLCBzdGFjayk7XG59O1xuXG4vLyBGaW5hbGx5IHdlIHNldCB1cCB0aGUgdHJpZ2dlciBmb3IgZXZlcnl0aGluZyBhYm92ZS5cbmNvbnN0IGRyb3BIYW5kbGVyID0gbmV3IERyb3BIYW5kbGVyKCdnaWYtZmlsZS1kcm9wJyk7XG5kcm9wSGFuZGxlci5vbignZHJvcCcsIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZURyb3AoZmlsZTogRmlsZSkge1xuXG4gIGNvbnN0IGpvYiA9IGF3YWl0IGdpZlByb2Nlc3Nvci5wcm9jZXNzKGZpbGUpLFxuICAgIGRpc3BsYXkgPSBuZXcgR2lmRGlzcGxheShmaWxlLm5hbWUsIHJvb3ROb2RlSWQpO1xuXG4gIGpvYi5vbigncHJvZ3Jlc3MnLCBjcmVhdGVKb2JQcm9ncmVzc0hhbmRsZXIoZGlzcGxheSkpO1xuICBqb2Iub24oJ2ZpbmlzaGVkJywgY3JlYXRlSm9iRmluaXNoZWRIYW5kbGVyKGRpc3BsYXkpKTtcbiAgam9iLm9uKCdlcnJvcicsIGNyZWF0ZUVycm9ySGFuZGxlcihkaXNwbGF5KSk7XG59KTtcblxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9